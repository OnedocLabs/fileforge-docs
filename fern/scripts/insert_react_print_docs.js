const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

(async () => {
  try {
    const docsPath = path.join(__dirname, "../react-print-pdf/docs/components");

    //-------------------------------------------------------------------------------- GENERATE DOCS.YML FILE for Fern --------------------------------------------------------------------------------
    // genreating the docs.yml file with dynamic content for components

    const docsYMLPath = path.join(__dirname, "../docs.yml");
    // Load and parse the YAML file
    const docYMLFile = yaml.load(
      fs.readFileSync(docsYMLPath, "utf8")
    );
    // Get the Components section
    let componentsSection = docYMLFile.navigation
      .find((section) => section.tab === "react-print")
      .layout.find((section) => section.section === "Components");

    componentsSection.contents = [];

    const subdirs = fs
      .readdirSync(docsPath, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);

    const sortedDocs = JSON.parse(
      fs.readFileSync(path.join(__dirname , "../react-print-pdf/docs/sortedDocs.json"), "utf8")
    );

    subdirs.forEach((subdir) => {
      // Create a new section for the subdirectory

      const doc = sortedDocs.find(
        (df) => df.name.toLocaleLowerCase() === subdir.toLocaleLowerCase()
      );
      const newSection = {
        section: subdir.charAt(0).toUpperCase() + subdir.slice(1),
        contents: [],
        icon: doc ? doc.icon : null,
      };

      // Get all mdx files in the subdirectory
      const mdxFiles = fs
        .readdirSync(path.join(docsPath, subdir))
        .filter((file) => path.extname(file) === ".mdx");

      // Add each mdx file to the new section
      mdxFiles.forEach((file) => {
        const slug = path.basename(file, ".mdx");
        newSection.contents.push({
          page: slug.charAt(0).toUpperCase() + slug.slice(1),
          path: `./react-print-pdf/docs/components/${subdir}/${file}`,
          slug: slug,
        });
      });

      // Add the new section to componentsSection.contents
      componentsSection.contents.push(newSection);
    });

    // Convert the updated object back into YAML
    const updatedYaml = yaml.dump(docYMLFile);

    // Write the updated YAML back to the file
    fs.writeFileSync(docsYMLPath, updatedYaml, "utf8");
  } catch (e) {
    console.log(e);
  }
})();
