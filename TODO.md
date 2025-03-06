## TODO

### Rubric Support

- Refactor: Make steps in "wizard" have explicit callbacks so we move between steps using explicit function calls rather than reactive code. This makes things like backtracking easier. (x)
- Check on functionality of store refactor (we were halfway through adding explicit callbacks...)

- Get rubric grades imported.
- Build interface for mapping rubric grade to unique assignments, meaning...

  - 1. Add a "step" to the wizard to choose the assignment mode (BARE / "strand")
  - 2. If the assignment has a rubric, those step (1)
  - 3. If we link a rubric, let's just key the assignment with a suffix indicating which "strand" we're posting.
  - 4. Update "sync grades" to support syncing rubric grades to multiple assignments _or_ to sync overall grade.

- Keep track of grades we've already created so we don't re-post (x)
- Update UI so we can see we're posting grades (x)

- Can we automate grade import so once we "link" we can
  automatically import grades going forward? (NOTE: this is potentially a security risk since we'd be running code on a schedule and we'd need a
  way to authenticate the user -- so how would we know the code we run
  on a schedule has the right permissions etc.?)
- Failing that: maybe we just make an "update" Button that grabs all
  linked assignments and updates grades accordingly. (x)
- See if we can get contain-css to work with our current setup so we can
  have a nice looking UI. (x)

## Done

As of September 2024, we have:

- Grade and Assignment Creation is working (x)
- Basic course mapping is functional (x)
