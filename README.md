# TimePort

TimePort is a CLI tool that bridges time tracking between Jira and Harvest, making it easy to manage your time entries with associated Jira issues.

## Prerequisites

- Node.js >= 18.0.0
- pnpm
- A Harvest account with API access
- A Jira account with API access

## Installation

You can install TimePort directly from GitHub:

```bash
pnpm add -g https://github.com/villekivela/timeport
```

## Configuration

The configuration file will be automatically created in:

- Windows: %APPDATA%\timeport\config.yaml
- Linux/macOS: ~/.config/timeport/config.yaml

Create a `config.yaml` file in the appropriate location with the following content:

```yaml
# Jira Configuration
jira:
  # Your Jira email address
  username: your.email@company.com
  # Your Jira API token (generate from Atlassian account settings)
  apiToken: your_jira_api_token
  # Your Jira instance URL
  baseUrl: https://your-company.atlassian.net

# Harvest Configuration
# Will be set up automatically during first run
harvest:
  # Your Harvest personal access token
  accessToken:
  # Your Harvest account ID (set automatically)
  accountId:
  # Your project ID (can be selected during setup)
  projectId:
  # Your task ID (can be selected during setup)
  taskId:
```

You can copy the sample configuration file from the repository's `config.sample.yaml` and modify it with your credentials.

### Required Configuration

The following Jira configuration values are required:

- `jira.username`: Your Jira email address
- `jira.apiToken`: Your Jira API token (generate from Atlassian account settings)
- `jira.baseUrl`: Your Jira instance URL

### Harvest Authentication

On first run, TimePort will guide you through the Harvest authentication process:

1. Get your Harvest Personal Access Token from <https://id.getharvest.com/developers>
2. When prompted, enter your Personal Access Token
3. Select your project and task for time tracking

The Harvest configuration will be automatically saved to your config file.

## Updating

To upgrade TimePort to the latest version, simply run:

```bash
tp upgrade
```

## Uninstalling

To remove TimePort from your system:

```bash
tp uninstall
```

This will uninstall the CLI tool. Your configuration in `~/.config/timeport` will remain untouched in case you want to reinstall later.

## Usage

### Interactive Mode

Simply run `tp` without any arguments to enter interactive mode, where you can:

- Start a timer with Jira issues
- Update timer notes
- Stop timer with optional final notes

### Direct Commands

You can also use direct commands:

#### Start a Timer

To start a timer with Jira issues:

```bash
tp start
```

#### Update a Timer with Notes

To update the timer notes:

```bash
tp update
```

#### Stop a Timer

To stop the timer and optionally add final notes:

```bash
tp stop
```
