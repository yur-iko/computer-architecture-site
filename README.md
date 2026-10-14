[Visit my website here!](https://yur-iko.github.io/computer-architechture-site/)

# Computer Architecture Lesson Reader

A static, offline-capable website containing 113 beginner-friendly lessons from Introduction and Chapters 1–5. It includes the full explanations, worked examples, tables, 27 teaching figures, source map, reading plan, and two PDF downloads.

## Read on your computer

Open `index.html` in your browser. Keep `assets` and `downloads` beside it. No installation or internet connection is needed for the lessons. External verification references need internet access. Choose lessons from the chapter sidebar, or use the Lessons button on a phone. Search finds lesson IDs, titles, and text. The Dark/Light button remembers your choice when browser storage is available. Lesson links can be bookmarked; Previous and Next follow the guide's order.

The Guide PDF includes practice questions. The separate Answer key PDF contains their solutions. Print this lesson prints only the selected lesson with a black-and-white A4 layout and 12-point Candara body text; other devices use the listed font fallbacks if Candara is unavailable.

## Publish on GitHub Pages — browser method

1. Sign in to GitHub. Create a new repository, for example `computer-architecture`. Choose Public if you use GitHub Free. You can initialize it with a README.
2. Open the repository's Code tab and choose **Add file → Upload files**.
3. Open this site's folder on your computer. Drag its **contents** into the upload area: `index.html`, `assets`, `downloads`, `README.md`, and `.nojekyll`. If you downloaded the ZIP, extract it first. Upload the folders themselves so their structure is preserved. **Do not upload the ZIP as the website, and do not nest the whole site inside another folder.**
4. Commit the upload to `main`. If you choose a new branch instead, finish the pull request and merge it into `main`.
5. Under **Settings → Pages → Build and deployment**, choose **Deploy from a branch**. Select **main** and **/(root)**, then click **Save**.
6. Allow up to about 10 minutes for deployment. Return to **Settings → Pages** and click **Visit site**. For the example repository, the project URL is `https://YOUR-USERNAME.github.io/computer-architecture/`.
7. Test a lesson, theme switching, a diagram, and both PDF links. Future commits to the selected branch update the site.

`.nojekyll` is an empty marker included to skip Jekyll processing. If the browser upload omitted it, choose **Add file → Create new file**, name it `.nojekyll`, and commit it. A single blank line is fine. This site does not require an npm build or a custom GitHub Actions workflow.

The repository root should look like this:

```text
index.html
.nojekyll
README.md
assets/
  styles.css
  app.js
  lessons.js
downloads/
  Step_by_Step_Guide.pdf
  Answer_Key.pdf
```

### If something does not work

- **404 at the homepage:** confirm that `index.html` is at the top level of the configured publishing folder and that Settings → Pages selects the right branch and folder. The filename must be lowercase `index.html`.
- **No formatting or no lessons:** confirm that the complete `assets` folder was uploaded beside `index.html` with its filenames unchanged.
- **A PDF link fails:** confirm that `downloads/Step_by_Step_Guide.pdf` and `downloads/Answer_Key.pdf` are present.
- **Changes are not visible:** wait for the Pages deployment in the Actions tab to complete, then reload the page. If needed, use Ctrl+F5.
- **Pages settings are unavailable on GitHub Free:** the repository needs to be Public.

This publishing package contains the generated teaching material and PDFs; the original course slide files are not part of it.

### Official GitHub instructions

Checked October 14, 2026:

- [Creating a GitHub Pages site](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site)
- [Configuring a publishing source](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
- [Uploading files to a repository](https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository)

## Edit this delivered website

The deployed website is already built. Edit `assets/styles.css` for styling, `assets/app.js` for reader behavior, or `assets/lessons.js` for lesson data. Keep relative paths so the site works at a GitHub Pages repository URL. The lesson data was generated from the same authoring source as the PDF guide.
