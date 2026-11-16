# Research: QA Master Polish and Layout

## Header recovery

**Decision**: Track scroll direction with one passive listener and RAF, hide only authenticated sessions after a threshold, and reveal on upward scroll, route change, focus capture and a fixed top-edge trigger.

**Rationale**: A translated header cannot be recovered by hovering itself. The independent trigger and keyboard recovery prevent an inaccessible state.

## Mentions

**Decision**: Link only a textual token that maps to `Comment.ReplyToUserId`/`ReplyToUser`; leave unmatched `@text` unchanged.

**Rationale**: Names and aliases are not unique. Resolving arbitrary strings server-side could notify or expose the wrong person. Existing directed replies already validate target, thread and self-suppression.

## Media selection

**Decision**: Persisted item order keeps the cover first; visible selection promotes the first YouTube item into remaining capacity before attachments. Desktop displays one half-size primary plus up to four bounded secondary cells.

**Rationale**: This prevents a video from disappearing behind attachment overflow without changing persistence order or gallery completeness.

## Global texture

**Decision**: Use the supplied image through a fixed pointer-inert pseudo-layer with low opacity and preserve opaque fallback theme colors.

**Rationale**: The source is large, so it is referenced once globally and not duplicated in component imports. No image-processing dependency or destructive conversion is introduced.

## Job focus

**Decision**: Server notifications emit `?jobOfferId={id}`. JobBoard validates the UUID-shaped query value by exact item match, then performs one RAF scroll/focus and a bounded highlight timeout.

**Rationale**: The ID is stable, does not require new state persistence and degrades safely if the offer is unavailable.

