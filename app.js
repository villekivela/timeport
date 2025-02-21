import { exec } from "child_process";
import inquirer from "inquirer";
import fetch from "node-fetch";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

const JIRA_USERNAME = process.env.JIRA_USERNAME;
const JIRA_API_TOKEN = process.env.JIRA_API_TOKEN;
const JIRA_BASE_URL = process.env.JIRA_BASE_URL;
const HRVST_PROJECT_ALIAS = process.env.HRVST_PROJECT_ALIAS;

// Check if all required environment variables are set
if (
  !JIRA_USERNAME ||
  !JIRA_API_TOKEN ||
  !JIRA_BASE_URL ||
  !HRVST_PROJECT_ALIAS
) {
  console.error("One or more environment variables are missing.");
  process.exit(1);
}

async function fetchJiraIssues() {
  const JQL_QUERY = `assignee = currentUser() AND statusCategory != Done AND issuetype != Sub-task`;
  const API_URL = `${JIRA_BASE_URL}/rest/api/3/search?jql=${encodeURIComponent(JQL_QUERY)}`;

  const response = await fetch(API_URL, {
    method: "GET",
    headers: {
      Authorization: `Basic ${Buffer.from(`${JIRA_USERNAME}:${JIRA_API_TOKEN}`).toString("base64")}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    console.error("Failed to fetch Jira issues:", response.statusText);
    process.exit(1);
  }

  const data = await response.json();
  return data.issues.map((issue) => ({
    name: `[${issue.key}] ${issue.fields.summary}`,
    value: issue.key,
  }));
}

async function createHarvestEntryWithNotes(issues, selectedIssues) {
  const notes = selectedIssues
    .map((issueKey) => {
      const issue = issues.find((issue) => issue.value === issueKey);
      return issue.name;
    })
    .join("\n");

  exec(
    `hrvst start ${HRVST_PROJECT_ALIAS} --notes "${notes}"`,
    (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing hrvst CLI: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`Error: ${stderr}`);
        return;
      }
      console.log(`Notes successfully added: ${stdout}`);
    },
  );
}

async function selectJiraIssues() {
  const issues = await fetchJiraIssues();

  const answers = await inquirer.prompt([
    {
      type: "checkbox",
      name: "selectedIssues",
      message: "Select Jira issues:",
      choices: issues,
    },
  ]);

  // Call createHarvestEntryWithNotes with the selected issues
  await createHarvestEntryWithNotes(issues, answers.selectedIssues);

  console.log("Selected Jira issues:", answers.selectedIssues);
}

selectJiraIssues();
