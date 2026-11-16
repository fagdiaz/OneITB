# Implementation Plan: Fix Shadow Properties

## Key Changes

1.  **Backend (`Entities`)**:
    -   Modificar `Subject.cs` para agregar `public virtual ICollection<Inquiry> Inquiries`.
    -   Modificar `Inquiry.cs` para agregar `public virtual Subject Subject`.

2.  **Backend (`Data`)**:
    -   Modificar `OneItbContext.cs` (OnModelCreating) para utilizar `HasOne(i => i.Subject).WithMany(s => s.Inquiries).HasForeignKey(i => i.SubjectId).OnDelete(DeleteBehavior.Restrict)`.
    -   Crear y aplicar migración `FixShadowProperties`.
