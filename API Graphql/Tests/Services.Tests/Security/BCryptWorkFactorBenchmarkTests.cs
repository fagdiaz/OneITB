using System.Diagnostics;
using System.Globalization;
using System.Runtime.InteropServices;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using Services.Auth;
using Xunit;
using Xunit.Abstractions;

namespace Services.Tests.Security;

[CollectionDefinition(BCryptBenchmarkCollection.Name, DisableParallelization = true)]
public sealed class BCryptBenchmarkCollection
{
    public const string Name = "GOB15 BCrypt isolated benchmark";
}

// Opt-in hardware gate. Exclude Category=GOB15BcryptBenchmark from ordinary regression.
// Run via scripts/Invoke-BCryptWorkFactorBenchmark.ps1 for a 20-second process deadline.
[Collection(BCryptBenchmarkCollection.Name)]
public sealed class BCryptWorkFactorBenchmarkTests(ITestOutputHelper output)
{
    private const string Password = "GOB15-synthetic-password-ABC-123!";
    private const int Samples = 5;
    private const int TimingBlocks = 5;
    private const double BudgetMs = 17_000;
    private const double FloorMs = 100;
    private const double SerialP95LimitMs = 500;
    private const double BurstP95LimitMs = 5_000;
    private const double ProbeLimitMs = 1_000;
    private readonly Stopwatch elapsed = new();
    private readonly Report report = new();

    [Fact]
    [Trait("Category", "GOB15BcryptBenchmark")]
    public async Task Calibrate_HashVerifyTimingCompatibilityAndConcurrentBursts()
    {
        Assert.Equal("true", Environment.GetEnvironmentVariable("ONEITB_RUN_GOB15_BCRYPT"));
        string root = Environment.GetEnvironmentVariable("ONEITB_BCRYPT_REPOSITORY") ?? "";
        Assert.True(File.Exists(Path.Combine(root, "API Graphql", "OneITB", "appsettings.json")),
            "ONEITB_BCRYPT_REPOSITORY must identify the checkout being measured.");
        Assert.True(int.TryParse(Environment.GetEnvironmentVariable("ONEITB_BCRYPT_EFFECTIVE_WORK_FACTOR"),
            NumberStyles.None, CultureInfo.InvariantCulture, out int configured),
            "Declare the effective deployment work factor explicitly.");
        Assert.InRange(configured, 10, 12); // Higher factors need a separate, longer hardware gate.
        string reportPath = Environment.GetEnvironmentVariable("ONEITB_BCRYPT_REPORT_PATH") ?? "";
        Assert.True(Path.IsPathFullyQualified(reportPath), "An absolute JSON evidence path is required.");

        using var settings = JsonDocument.Parse(File.ReadAllText(
            Path.Combine(root, "API Graphql", "OneITB", "appsettings.json")));
        report.CheckedInWorkFactor = settings.RootElement.GetProperty("PasswordHashing")
            .GetProperty("WorkFactor").GetInt32();
        report.EffectiveWorkFactor = configured;
        report.Framework = RuntimeInformation.FrameworkDescription;
        report.OperatingSystem = RuntimeInformation.OSDescription;
        report.Architecture = RuntimeInformation.ProcessArchitecture.ToString();
        report.ProcessorCount = Environment.ProcessorCount;
        report.Revision = Environment.GetEnvironmentVariable("ONEITB_BCRYPT_REVISION") ?? "UNBOUND";
        report.StartedUtc = DateTimeOffset.UtcNow;
        ThreadPool.GetMinThreads(out int minWorkers, out _);
        ThreadPool.GetMaxThreads(out int maxWorkers, out _);
        report.MinimumWorkerThreads = minWorkers;
        report.MaximumWorkerThreads = maxWorkers;
        using var process = Process.GetCurrentProcess();
        TimeSpan cpuStart = process.TotalProcessorTime;
        elapsed.Start();
        try
        {
            var profiles = new List<Profile>();
            var hashes = new Dictionary<int, string>();
            foreach (int factor in new[] { 10, 11, 12 })
            {
                var hasher = Hasher(factor);
                // Hash and verify JIT warm-up is outside per-operation samples, inside total budget.
                string warm = Measure("warm-up hash", () => hasher.Hash(Password), out _);
                Check(Measure("warm-up verify", () => hasher.Verify(Password, warm), out _),
                    $"Cost {factor}: warm-up verification failed.");
                var hashTimes = new List<double>();
                var verifyTimes = new List<double>();
                var distinctHashes = new HashSet<string>(StringComparer.Ordinal);
                for (int i = 0; i < Samples; i++)
                {
                    string hash = Measure("serial hash", () => hasher.Hash(Password), out double hashMs);
                    bool valid = Measure("serial verify", () => hasher.Verify(Password, hash), out double verifyMs);
                    Check(valid && hash.Length == 60 && Cost(hash) == factor,
                        $"Cost {factor}: hash/verify round-trip failed.");
                    Check(!hasher.NeedsRehash(hash), $"Cost {factor}: unexpected rehash request.");
                    Check(distinctHashes.Add(hash), $"Cost {factor}: repeated randomly salted hash.");
                    hashTimes.Add(hashMs);
                    verifyTimes.Add(verifyMs);
                    hashes[factor] = hash;
                }
                var profile = new Profile(factor, Describe(hashTimes), Describe(verifyTimes));
                profiles.Add(profile);
                report.Profiles.Add(profile);
            }

            var activeHasher = Hasher(configured);
            Profile active = profiles.Single(p => p.WorkFactor == configured);
            Check(active.Hash.MinMs >= FloorMs,
                $"PR-05: configured cost {configured} has a hash sample below {FloorMs} ms.");
            Check(active.Hash.P50Ms >= FloorMs, "PR-05: hash p50 is below the institutional floor.");
            Check(active.Hash.P95Ms <= SerialP95LimitMs,
                $"PR-05: serial hash p95 exceeds the declared {SerialP95LimitMs} ms guardrail.");
            Check(active.Verify.P95Ms <= SerialP95LimitMs,
                $"PR-05: serial verify p95 exceeds the declared {SerialP95LimitMs} ms guardrail.");

            MeasureTiming(activeHasher, hashes[configured]);
            MeasureCompatibility(hashes);
            foreach (int burstSize in new[] { 8, 16 })
                await MeasureBurstAsync(activeHasher, hashes[configured], configured, burstSize);

            // Candidate is advisory until its own burst run is accepted on this target.
            report.CalibrationCandidate = profiles
                .Where(p => p.Hash.MinMs >= FloorMs &&
                    p.Hash.P95Ms <= SerialP95LimitMs && p.Verify.P95Ms <= SerialP95LimitMs)
                .Select(p => (int?)p.WorkFactor).FirstOrDefault();
            report.RecommendedWorkFactor = report.Failures.Count == 0 &&
                report.CalibrationCandidate == configured ? configured : null;
            report.Status = report.Failures.Count == 0 ? "PASS_SCREENING" : "FAIL";
        }
        catch (Exception exception)
        {
            // Never serialize exception messages: paths/provider data may be sensitive.
            report.Status = exception is BudgetExceededException ? "BUDGET_EXCEEDED" : "ERROR";
            report.Failures.Add("Incomplete measurement: " + exception.GetType().Name);
            throw;
        }
        finally
        {
            report.ElapsedMs = elapsed.Elapsed.TotalMilliseconds;
            process.Refresh();
            report.CpuMs = (process.TotalProcessorTime - cpuStart).TotalMilliseconds;
            report.CpuPercentOfVisibleCapacity = 100 * report.CpuMs /
                Math.Max(1, report.ElapsedMs * Environment.ProcessorCount);
            report.CompletedUtc = DateTimeOffset.UtcNow;
            string json = JsonSerializer.Serialize(report, new JsonSerializerOptions { WriteIndented = true });
            Directory.CreateDirectory(Path.GetDirectoryName(reportPath)!);
            // Atomic replacement preserves the previous valid checkpoint if execution is interrupted.
            string temporary = reportPath + ".tmp";
            File.WriteAllText(temporary, json);
            File.Move(temporary, reportPath, overwrite: true);
            output.WriteLine(json);
        }
        Assert.True(report.Failures.Count == 0, string.Join(Environment.NewLine, report.Failures));
    }

    private void MeasureTiming(BcryptPasswordHasher hasher, string hash)
    {
        // ASCII inputs remain below BCrypt's 72-byte boundary. Empty/malformed inputs
        // intentionally short-circuit in production and are not timing-equivalent cohorts.
        string[] inputs = [Password, "?" + Password[1..], Password[..^1] + "?",
            "?", new string('?', 64)];
        string[] labels = ["valid", "invalid-first", "invalid-last", "invalid-short", "invalid-long"];
        var times = inputs.Select(_ => new List<double>()).ToArray();
        var pairedRatios = inputs.Select(_ => new List<double>()).ToArray();
        for (int block = 0; block < TimingBlocks; block++)
        {
            var blockTimes = new double[inputs.Length];
            // Latin rotation balances every cohort across every position exactly once.
            for (int offset = 0; offset < inputs.Length; offset++)
            {
                int index = (block + offset) % inputs.Length;
                bool valid = Measure("timing verify", () => hasher.Verify(inputs[index], hash), out double ms);
                Check(valid == (index == 0), $"Timing cohort {labels[index]} returned an incorrect result.");
                times[index].Add(ms);
                blockTimes[index] = ms;
            }
            for (int index = 1; index < inputs.Length; index++)
                pairedRatios[index].Add(blockTimes[index] / blockTimes[0]);
        }
        for (int index = 0; index < inputs.Length; index++)
        {
            double? ratio = index == 0 ? null : Percentile(pairedRatios[index], .5);
            report.Timing.Add(new TimingCohort(labels[index], Describe(times[index]), ratio));
            // Coarse regression screen, NOT a statistical proof of constant-time execution.
            if (ratio is double median)
                Check(median >= 2d / 3 && median <= 1.5,
                    $"Timing cohort {labels[index]} differs by more than the declared 1.5x band.");
        }
        Check(!hasher.Verify("", hash), "Empty password unexpectedly verified.");
        Check(!hasher.Verify(Password, "not-a-bcrypt-hash"), "Malformed hash unexpectedly verified.");
    }

    private void MeasureCompatibility(IReadOnlyDictionary<int, string> hashes)
    {
        foreach (int activeFactor in new[] { 10, 11, 12 })
        {
            var hasher = Hasher(activeFactor);
            foreach ((int embeddedFactor, string hash) in hashes)
            {
                bool verified = Measure("cross-cost compatibility",
                    () => hasher.Verify(Password, hash), out _);
                Check(verified, $"Active {activeFactor} rejected an existing cost {embeddedFactor} hash.");
                Check(hasher.NeedsRehash(hash) == (embeddedFactor < activeFactor),
                    $"Active {activeFactor}, stored {embeddedFactor}: incorrect rehash/no-downgrade decision.");
                report.CompatibilityChecks++;
            }
        }
        Check(report.CompatibilityChecks == 9, "Incomplete 3x3 compatibility matrix.");
    }

    private async Task MeasureBurstAsync(BcryptPasswordHasher hasher, string existingHash,
        int factor, int count)
    {
        RequireBudget();
        double idleProbeMs = await ProbeAsync();
        using var process = Process.GetCurrentProcess();
        TimeSpan cpuStart = process.TotalProcessorTime;
        int threadsBefore = ThreadPool.ThreadCount;
        long pendingBefore = ThreadPool.PendingWorkItemCount;
        var start = new TaskCompletionSource(TaskCreationOptions.RunContinuationsAsynchronously);
        int active = 0, peakActive = 0, peakThreads = threadsBefore;
        long peakPending = pendingBefore;
        long submitted = 0;
        Task<BurstSample>[] workers = Enumerable.Range(0, count).Select(index => Task.Run(async () =>
        {
            await start.Task;
            RequireBudget();
            long begin = Stopwatch.GetTimestamp();
            int current = Interlocked.Increment(ref active);
            Max(ref peakActive, current);
            Max(ref peakThreads, ThreadPool.ThreadCount);
            Max(ref peakPending, ThreadPool.PendingWorkItemCount);
            try
            {
                bool hashOperation = index % 2 == 0;
                bool expected = index % 4 == 1;
                string? generated = hashOperation ? hasher.Hash(Password) : null;
                bool correct = hashOperation
                    ? generated!.Length == 60 && Cost(generated) == factor
                    : hasher.Verify(expected ? Password : "Wrong-fixture", existingHash) == expected;
                long end = Stopwatch.GetTimestamp();
                return new BurstSample(index, hashOperation ? "hash" : "verify", correct,
                    Stopwatch.GetElapsedTime(submitted, begin).TotalMilliseconds,
                    Stopwatch.GetElapsedTime(begin, end).TotalMilliseconds,
                    Stopwatch.GetElapsedTime(submitted, end).TotalMilliseconds, generated);
            }
            finally { Interlocked.Decrement(ref active); }
        })).ToArray();
        submitted = Stopwatch.GetTimestamp();
        start.SetResult();
        // A benign work item queued after submission measures scheduler responsiveness.
        Task<double> probe = ProbeAsync();
        BurstSample[] completed;
        double loadedProbeMs;
        try { completed = await Task.WhenAll(workers); }
        finally
        {
            // All started work is drained even on faults. Never abandon BCrypt CPU work.
            loadedProbeMs = await probe;
        }
        double burstMs = Stopwatch.GetElapsedTime(submitted).TotalMilliseconds;
        process.Refresh();
        double cpuMs = (process.TotalProcessorTime - cpuStart).TotalMilliseconds;
        double recoveryProbeMs = await ProbeAsync();
        var result = new Burst(count, Describe(completed.Select(x => x.QueueMs)),
            Describe(completed.Select(x => x.ServiceMs)), Describe(completed.Select(x => x.TotalMs)),
            burstMs, 1000 * count / burstMs, cpuMs,
            100 * cpuMs / Math.Max(1, burstMs * Environment.ProcessorCount),
            idleProbeMs, loadedProbeMs, recoveryProbeMs, peakActive, threadsBefore,
            peakThreads, ThreadPool.ThreadCount, pendingBefore, peakPending,
            ThreadPool.PendingWorkItemCount,
            completed.Where(x => x.Operation == "hash").Count(),
            completed.Where(x => x.Operation == "verify").Count());
        report.Bursts.Add(result);
        Check(completed.Length == count && completed.Select(x => x.Index).Distinct().Count() == count,
            $"Burst {count}: work was lost or duplicated.");
        Check(completed.All(x => x.Correct), $"Burst {count}: incorrect cryptographic results.");
        Check(active == 0, $"Burst {count}: active work remained after completion.");
        string[] created = completed.Where(x => x.GeneratedHash != null).Select(x => x.GeneratedHash!).ToArray();
        Check(created.Distinct(StringComparer.Ordinal).Count() == count / 2,
            $"Burst {count}: concurrent hashing reused a salt/hash.");
        // Validate every generated hash after the measured burst, without inflating its latency.
        bool[] roundTrips = await Task.WhenAll(created.Select(hash => Task.Run(() =>
            Measure("burst hash round-trip", () => hasher.Verify(Password, hash), out _))));
        Check(roundTrips.Length == count / 2 && roundTrips.All(x => x),
            $"Burst {count}: a generated hash failed round-trip.");
        Check(result.EndToEnd.P95Ms <= BurstP95LimitMs,
            $"Burst {count}: end-to-end p95 exceeds {BurstP95LimitMs} ms.");
        Check(loadedProbeMs <= ProbeLimitMs && recoveryProbeMs <= ProbeLimitMs,
            $"Burst {count}: benign work item latency exceeds {ProbeLimitMs} ms.");
    }

    private static async Task<double> ProbeAsync()
    {
        long submitted = Stopwatch.GetTimestamp();
        return await Task.Run(() => Stopwatch.GetElapsedTime(submitted).TotalMilliseconds);
    }

    private T Measure<T>(string stage, Func<T> operation, out double milliseconds)
    {
        RequireBudget(stage);
        long start = Stopwatch.GetTimestamp();
        T result = operation();
        milliseconds = Stopwatch.GetElapsedTime(start).TotalMilliseconds;
        return result;
    }

    private void RequireBudget(string stage = "burst")
    {
        if (elapsed.Elapsed.TotalMilliseconds >= BudgetMs)
            throw new BudgetExceededException(stage);
    }

    private void Check(bool condition, string message)
    {
        if (!condition) report.Failures.Add(message);
    }

    private static BcryptPasswordHasher Hasher(int factor) => new(
        PasswordHashingOptions.FromConfiguration(new ConfigurationBuilder().AddInMemoryCollection(
            [new KeyValuePair<string, string?>("PasswordHashing:WorkFactor",
                factor.ToString(CultureInfo.InvariantCulture))]).Build()));

    private static int Cost(string hash) => int.Parse(hash.Split('$')[2], CultureInfo.InvariantCulture);

    // Nearest-rank empirical percentile. With n=5, p95 is the maximum, not a population estimate.
    private static double Percentile(IEnumerable<double> values, double percentile)
    {
        double[] sorted = values.Order().ToArray();
        if (sorted.Length == 0 || sorted.Any(x => !double.IsFinite(x) || x <= 0))
            throw new InvalidOperationException("Timing samples must be positive and finite.");
        return sorted[(int)Math.Ceiling(percentile * sorted.Length) - 1];
    }

    private static Distribution Describe(IEnumerable<double> samples)
    {
        double[] values = samples.ToArray();
        return new(values.Length, values.Min(), Percentile(values, .5),
            Percentile(values, .95), values.Max(), values);
    }

    private static void Max(ref int target, int value)
    {
        int previous;
        do { previous = Volatile.Read(ref target); if (previous >= value) return; }
        while (Interlocked.CompareExchange(ref target, value, previous) != previous);
    }

    private static void Max(ref long target, long value)
    {
        long previous;
        do { previous = Volatile.Read(ref target); if (previous >= value) return; }
        while (Interlocked.CompareExchange(ref target, value, previous) != previous);
    }

    private sealed class BudgetExceededException(string stage) : Exception(stage);
    private sealed record Distribution(int Count, double MinMs, double P50Ms,
        double P95Ms, double MaxMs, double[] SamplesMs);
    private sealed record Profile(int WorkFactor, Distribution Hash, Distribution Verify);
    private sealed record TimingCohort(string Cohort, Distribution Verify, double? PairedMedianRatio);
    private sealed record BurstSample(int Index, string Operation, bool Correct,
        double QueueMs, double ServiceMs, double TotalMs, string? GeneratedHash);
    private sealed record Burst(int Requests, Distribution Queue, Distribution Service,
        Distribution EndToEnd, double WallMs, double RequestsPerSecond, double CpuMs,
        double CpuPercentOfVisibleCapacity, double IdleProbeMs, double LoadedProbeMs,
        double RecoveryProbeMs, int PeakActive, int ThreadsBefore, int PeakThreads,
        int ThreadsAfter, long PendingBefore, long PeakPending, long PendingAfter,
        int HashRequests, int VerifyRequests);

    private sealed class Report
    {
        public string Handoff { get; } = "GOB-20261109-15";
        public string Status { get; set; } = "INCOMPLETE";
        public string Revision { get; set; } = "";
        public string Framework { get; set; } = "";
        public string OperatingSystem { get; set; } = "";
        public string Architecture { get; set; } = "";
        public string ConfigurationSource { get; } = "Operator-declared effective factor; confirm deployment configuration.";
        public string Scope { get; } = "Hasher-only screening; excludes HTTP, DB, JWT, rate limits and account enumeration.";
        public string PercentileMethod { get; } = "Nearest rank; small n, empirical p95 only; no confidence interval.";
        public string TimingClaim { get; } = "Coarse paired 1.5x regression screen; NOT proof of constant time.";
        public int ProcessorCount { get; set; }
        public int CheckedInWorkFactor { get; set; }
        public int EffectiveWorkFactor { get; set; }
        public int MinimumWorkerThreads { get; set; }
        public int MaximumWorkerThreads { get; set; }
        public DateTimeOffset StartedUtc { get; set; }
        public DateTimeOffset CompletedUtc { get; set; }
        public double ElapsedMs { get; set; }
        public double CpuMs { get; set; }
        public double CpuPercentOfVisibleCapacity { get; set; }
        public int CompatibilityChecks { get; set; }
        public int? CalibrationCandidate { get; set; }
        public int? RecommendedWorkFactor { get; set; }
        public double InstitutionalHashFloorMs { get; } = FloorMs;
        public double SerialP95GuardrailMs { get; } = SerialP95LimitMs;
        public double BurstP95GuardrailMs { get; } = BurstP95LimitMs;
        public double SchedulerProbeGuardrailMs { get; } = ProbeLimitMs;
        public List<Profile> Profiles { get; } = [];
        public List<TimingCohort> Timing { get; } = [];
        public List<Burst> Bursts { get; } = [];
        public List<string> Failures { get; } = [];
    }
}
