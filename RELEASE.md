# Release Process

To create a new release:

1. Update versions in:

   - package.json

2. Commit the changes:

   ```bash
   git add package.json
   git commit -m "Bump version to x.x.x"
   ```

3. Create and push a new tag:

   ```bash
   git tag -a vx.x.x -m "Version x.x.x"
   git push origin main vx.x.x
   ```

4. The GitHub Action will automatically:
   - Verify version consistency
   - Create a GitHub Release
   - Generate release notes

If the versions don't match, the workflow will fail and notify you.
