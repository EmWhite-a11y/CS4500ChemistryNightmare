import * as shell from "shelljs";

shell.cp("-R", "src/public/images", "dist/public/");
shell.cp("src/public/favicon.ico", "dist/public/favicon.ico");