using HotChocolate.Data.Filters;
using HotChocolate.Data.Sorting;
using OneItb.Entities.Models;

namespace GraphQL.GraphQL;

// Restrict lookup and ordering to offer fields; applicant data must not be inferable through relational filters.
public sealed class JobOfferFilter : FilterInputType<JobOffer>
{
    protected override void Configure(IFilterInputTypeDescriptor<JobOffer> descriptor)
    {
        descriptor.BindFieldsExplicitly();
        descriptor.Field(o => o.Id);
        descriptor.Field(o => o.Title);
        descriptor.Field(o => o.Company);
        descriptor.Field(o => o.Description);
        descriptor.Field(o => o.Location);
        descriptor.Field(o => o.EmployerId);
        descriptor.Field(o => o.IsActive);
        descriptor.Field(o => o.CreatedAt);
    }
}

public sealed class JobOfferSort : SortInputType<JobOffer>
{
    protected override void Configure(ISortInputTypeDescriptor<JobOffer> descriptor)
    {
        descriptor.BindFieldsExplicitly();
        descriptor.Field(o => o.Id);
        descriptor.Field(o => o.Title);
        descriptor.Field(o => o.Company);
        descriptor.Field(o => o.Description);
        descriptor.Field(o => o.Location);
        descriptor.Field(o => o.EmployerId);
        descriptor.Field(o => o.IsActive);
        descriptor.Field(o => o.CreatedAt);
    }
}
