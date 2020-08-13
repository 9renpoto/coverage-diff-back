#!/usr/bin/env node
import fs from "fs";
import { sync as glob } from "glob";
import yargs from "yargs";
import envCI from "env-ci";
import getArtifactFetcher from "./artifacts/index";
import { collect } from "./collect";
import { reporter } from "./report";
import { statusUpdater } from "./statusUpdater";

const options = yargs
  .scriptName("coverage-diff-back")
  .usage("Usage: $0 [options]")
  .option("coverage-glob", {
    type: "string",
    default: "**/coverage/coverage-summary.json",
    description: "A glob pattern to specify path of coverage-summary.json",
  })
  .option("from", {
    type: "string",
    default: "master",
    description: "Compare branch",
  })
  .option("status", {
    type: "boolean",
    description: "Update commit status",
  })
  .option("circleci-workflow", {
    type: "string",
    default: "build",
    description: "Name of CircleCI workflow",
  })
  .example("$0 --no-status", "# Doesn't update commit status")
  .example(
    "$0 --from develop",
    "# Compare between develop and current pull request"
  )
  .epilogue(
    "For more information, find our manual at https://github.com/Leko/coverage-diff-back"
  )
  .wrap(Math.min(90, yargs.terminalWidth())).argv;

const { GITHUB_TOKEN } = process.env;
if (!GITHUB_TOKEN) {
  throw new Error("Environment variable GITHUB_TOKEN must be required");
}

const res = envCI();

if (!res.isCi || res.service !== "circleci") throw new Error("Not support CI");

const { service, slug, pr, isPr, commit, buildUrl } = res;
if (!isPr || !pr) {
  console.log("This build is not triggered by pull request. Nothing to do.");
  process.exit(0);
}

collect({
  cwd: process.cwd(),
  slug,
  branch: options.from,
  globPattern: options["coverage-glob"],
  artifactFetcher: getArtifactFetcher(service),
  globFetcher: async (pattern) =>
    glob(pattern, { ignore: "**/{node_modules,.git}/**" }).map((path) => ({
      path,
      coverage: JSON.parse(fs.readFileSync(path, "utf8")),
    })),
  circleciWorkflow: options["circleci-workflow"],
})
  .then((diffReports) => {
    if (diffReports.length === 0) {
      throw new Error("Cannot found any coverage reports");
    }
    return diffReports;
  })
  .then(async (diffReports) => {
    const sendComment = reporter({
      slug,
      prId: pr,
      branch: options.from,
      token: GITHUB_TOKEN,
    });
    const updateStatus = statusUpdater({
      slug,
      sha: commit,
      buildUrl,
      token: GITHUB_TOKEN,
    });

    const pendings = [
      sendComment(diffReports).then((url: string) => {
        console.log(`Comment created: ${url}`);
      }),
      updateStatus(diffReports),
    ];

    await Promise.all(pendings);
  })
  .catch((error: Error) => {
    console.error(error);
    process.exit(1);
  });
