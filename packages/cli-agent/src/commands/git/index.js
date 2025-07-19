const { Command } = require("commander");
const { AdminUtils } = require("../../utils/admin");
const { logger } = require("../../utils/logger");
const { config: _config } = require("../../utils/config"); // eslint-disable-line no-unused-vars
const chalk = require("chalk");
const { spawn: _spawn, exec } = require("child_process"); // eslint-disable-line no-unused-vars
const fs = require("fs-extra"); // eslint-disable-line no-unused-vars
const path = require("path"); // eslint-disable-line no-unused-vars
const { promisify } = require("util");

const execAsync = promisify(exec);

/**
 * Git command with comprehensive version control functionality
 */
class GitCommand {
  constructor() {
    this.gitCommand = new Command("git").description(
      "Comprehensive Git version control operations",
    );

    this.setupSubcommands();
  }

  /**
   * Setup git subcommands
   */
  setupSubcommands() {
    // Status and information commands
    this.gitCommand
      .command("status")
      .description("Show repository status")
      .option("-s, --short", "Show status in short format")
      .option("--porcelain", "Machine-readable output")
      .action(
        AdminUtils.createAdminCommand("git status", this.showStatus.bind(this)),
      );

    this.gitCommand
      .command("log")
      .description("Show commit history")
      .option("-n, --number <count>", "Number of commits to show", "10")
      .option("--oneline", "Show one line per commit")
      .option("--graph", "Show commit graph")
      .option("--author <author>", "Filter by author")
      .option("--since <date>", "Show commits since date")
      .action(
        AdminUtils.createAdminCommand("git log", this.showLog.bind(this)),
      );

    this.gitCommand
      .command("diff")
      .description("Show changes")
      .option("--cached", "Show staged changes")
      .option("--name-only", "Show only file names")
      .option("--stat", "Show diffstat")
      .argument("[files...]", "Specific files to diff")
      .action(
        AdminUtils.createAdminCommand("git diff", this.showDiff.bind(this)),
      );

    // Branch management
    this.gitCommand
      .command("branch")
      .description("Manage branches")
      .option("-a, --all", "Show all branches (local and remote)")
      .option("-r, --remote", "Show remote branches")
      .option("-d, --delete <branch>", "Delete branch")
      .option("-D, --force-delete <branch>", "Force delete branch")
      .option("-m, --move <old> <new>", "Rename branch")
      .argument("[branch-name]", "Create new branch")
      .action(
        AdminUtils.createAdminCommand(
          "git branch",
          this.manageBranches.bind(this),
        ),
      );

    this.gitCommand
      .command("checkout")
      .description("Switch branches or restore files")
      .option("-b, --create-branch", "Create and switch to new branch")
      .option("-f, --force", "Force checkout")
      .option("--track", "Set up tracking for new branch")
      .argument("<branch-or-file>", "Branch name or file path")
      .argument("[files...]", "Additional files to checkout")
      .action(
        AdminUtils.createAdminCommand(
          "git checkout",
          this.checkoutBranch.bind(this),
        ),
      );

    // Working directory operations
    this.gitCommand
      .command("add")
      .description("Add files to staging area")
      .option("-A, --all", "Add all changes")
      .option("-u, --update", "Add only tracked files")
      .option("-p, --patch", "Interactively add changes")
      .option("-n, --dry-run", "Show what would be added")
      .argument("[files...]", "Files to add")
      .action(
        AdminUtils.createAdminCommand("git add", this.addFiles.bind(this)),
      );

    this.gitCommand
      .command("commit")
      .description("Create a commit")
      .option("-m, --message <message>", "Commit message")
      .option("-a, --all", "Commit all changes")
      .option("--amend", "Amend previous commit")
      .option("-n, --no-verify", "Skip pre-commit hooks")
      .action(
        AdminUtils.createAdminCommand(
          "git commit",
          this.createCommit.bind(this),
        ),
      );

    this.gitCommand
      .command("push")
      .description("Push changes to remote")
      .option("-u, --set-upstream", "Set upstream for current branch")
      .option("-f, --force", "Force push")
      .option("--dry-run", "Show what would be pushed")
      .option("--tags", "Push tags")
      .argument("[remote]", "Remote name", "origin")
      .argument("[branch]", "Branch name")
      .action(
        AdminUtils.createAdminCommand("git push", this.pushChanges.bind(this), {
          requireConfirmation: true,
          action: "push changes to remote repository",
          warning:
            "This will upload your local changes to the remote repository.",
        }),
      );

    this.gitCommand
      .command("pull")
      .description("Pull changes from remote")
      .option("--rebase", "Rebase instead of merge")
      .option("--ff-only", "Only fast-forward merges")
      .option("--no-commit", "Don't commit after merge")
      .argument("[remote]", "Remote name", "origin")
      .argument("[branch]", "Branch name")
      .action(
        AdminUtils.createAdminCommand("git pull", this.pullChanges.bind(this)),
      );

    // Remote management
    this.gitCommand
      .command("remote")
      .description("Manage remotes")
      .option("-v, --verbose", "Show remote URLs")
      .option("--add <name> <url>", "Add new remote")
      .option("--remove <name>", "Remove remote")
      .option("--set-url <name> <url>", "Change remote URL")
      .action(
        AdminUtils.createAdminCommand(
          "git remote",
          this.manageRemotes.bind(this),
        ),
      );

    // Stash operations
    this.gitCommand
      .command("stash")
      .description("Manage stash")
      .option("--list", "List stashes")
      .option("--pop", "Apply and remove latest stash")
      .option("--apply", "Apply latest stash")
      .option("--drop", "Remove latest stash")
      .option("--clear", "Remove all stashes")
      .option("-m, --message <message>", "Stash message")
      .action(
        AdminUtils.createAdminCommand("git stash", this.manageStash.bind(this)),
      );

    // Tag management
    this.gitCommand
      .command("tag")
      .description("Manage tags")
      .option("-l, --list", "List tags")
      .option("-d, --delete <tag>", "Delete tag")
      .option("-a, --annotate", "Create annotated tag")
      .option("-m, --message <message>", "Tag message")
      .argument("[tag-name]", "Tag name to create")
      .argument("[commit]", "Commit to tag")
      .action(
        AdminUtils.createAdminCommand("git tag", this.manageTags.bind(this)),
      );

    // Advanced operations
    this.gitCommand
      .command("merge")
      .description("Merge branches")
      .option("--no-ff", "No fast-forward merge")
      .option("--squash", "Squash merge")
      .option("--abort", "Abort current merge")
      .argument("<branch>", "Branch to merge")
      .action(
        AdminUtils.createAdminCommand(
          "git merge",
          this.mergeBranch.bind(this),
          {
            requireConfirmation: true,
            action: "merge branch",
            warning:
              "This will merge the specified branch into the current branch.",
          },
        ),
      );

    this.gitCommand
      .command("rebase")
      .description("Rebase current branch")
      .option("-i, --interactive", "Interactive rebase")
      .option("--continue", "Continue rebase after resolving conflicts")
      .option("--abort", "Abort current rebase")
      .argument("[branch]", "Branch to rebase onto")
      .action(
        AdminUtils.createAdminCommand(
          "git rebase",
          this.rebaseBranch.bind(this),
          {
            requireConfirmation: true,
            action: "rebase branch",
            warning: "This will rewrite commit history. Use with caution.",
          },
        ),
      );

    // Repository management
    this.gitCommand
      .command("clone")
      .description("Clone a repository")
      .option("--depth <depth>", "Create shallow clone with history depth")
      .option("--branch <branch>", "Clone specific branch")
      .option("--single-branch", "Clone only one branch")
      .argument("<url>", "Repository URL")
      .argument("[directory]", "Target directory")
      .action(
        AdminUtils.createAdminCommand(
          "git clone",
          this.cloneRepository.bind(this),
        ),
      );

    this.gitCommand
      .command("init")
      .description("Initialize repository")
      .option("--bare", "Create bare repository")
      .option("--template <template>", "Use template directory")
      .argument("[directory]", "Repository directory")
      .action(
        AdminUtils.createAdminCommand(
          "git init",
          this.initRepository.bind(this),
        ),
      );

    // Analysis and cleanup
    this.gitCommand
      .command("clean")
      .description("Clean working directory")
      .option("-n, --dry-run", "Show what would be cleaned")
      .option("-f, --force", "Force clean")
      .option("-d, --directories", "Clean directories too")
      .option("-x, --ignored", "Clean ignored files too")
      .action(
        AdminUtils.createAdminCommand(
          "git clean",
          this.cleanWorkingDirectory.bind(this),
          {
            requireConfirmation: true,
            action: "clean working directory",
            warning: "This will permanently delete untracked files.",
          },
        ),
      );

    this.gitCommand
      .command("gc")
      .description("Cleanup and optimize repository")
      .option("--aggressive", "More aggressive optimization")
      .option("--prune", "Prune loose objects")
      .action(
        AdminUtils.createAdminCommand("git gc", this.garbageCollect.bind(this)),
      );
  }

  /**
   * Show repository status
   */
  async showStatus(options, _command) {
    const { short, porcelain } = options;

    logger.info("Checking git status", { short, porcelain });

    if (!(await this.isGitRepository())) {
      console.log(chalk.red("❌ Not a git repository"));
      return;
    }

    console.log(chalk.blue("📊 Repository Status:"));

    try {
      const args = ["status"];
      if (short) args.push("--short");
      if (porcelain) args.push("--porcelain");

      const { stdout } = await execAsync(`git ${args.join(" ")}`);

      if (short || porcelain) {
        console.log(stdout);
      } else {
        console.log(this.formatGitStatus(stdout));
      }

      // Show additional repository info
      await this.showRepositoryInfo();
    } catch (error) {
      console.log(chalk.red(`❌ Error checking status: ${error.message}`));
      logger.error("Git status failed", error);
    }
  }

  /**
   * Show commit history
   */
  async showLog(options, _command) {
    const { number, oneline, graph, author, since } = options;

    logger.info("Showing git log", { number, oneline, graph, author, since });

    if (!(await this.isGitRepository())) {
      console.log(chalk.red("❌ Not a git repository"));
      return;
    }

    console.log(chalk.blue("📚 Commit History:"));

    try {
      const args = ["log", `--max-count=${number}`];

      if (oneline) args.push("--oneline");
      if (graph) args.push("--graph", "--decorate");
      if (author) args.push(`--author=${author}`);
      if (since) args.push(`--since=${since}`);

      const { stdout } = await execAsync(`git ${args.join(" ")}`);
      console.log(stdout);
    } catch (error) {
      console.log(chalk.red(`❌ Error showing log: ${error.message}`));
      logger.error("Git log failed", error);
    }
  }

  /**
   * Show repository changes
   */
  async showDiff(files, options, _command) {
    const { cached, nameOnly, stat } = options;

    logger.info("Showing git diff", { cached, nameOnly, stat, files });

    if (!(await this.isGitRepository())) {
      console.log(chalk.red("❌ Not a git repository"));
      return;
    }

    console.log(chalk.blue("📝 Repository Changes:"));

    try {
      const args = ["diff"];

      if (cached) args.push("--cached");
      if (nameOnly) args.push("--name-only");
      if (stat) args.push("--stat");
      if (files && files.length > 0) args.push(...files);

      const { stdout } = await execAsync(`git ${args.join(" ")}`);

      if (stdout.trim()) {
        console.log(stdout);
      } else {
        console.log(chalk.green("✅ No changes to show"));
      }
    } catch (error) {
      console.log(chalk.red(`❌ Error showing diff: ${error.message}`));
      logger.error("Git diff failed", error);
    }
  }

  /**
   * Manage branches
   */
  async manageBranches(branchName, options, _command) {
    const { all, remote, delete: deleteBranch, forceDelete, move } = options;

    logger.info("Managing branches", {
      branchName,
      all,
      remote,
      deleteBranch,
      forceDelete,
      move,
    });

    if (!(await this.isGitRepository())) {
      console.log(chalk.red("❌ Not a git repository"));
      return;
    }

    try {
      if (deleteBranch) {
        await execAsync(`git branch -d ${deleteBranch}`);
        console.log(chalk.green(`✅ Branch '${deleteBranch}' deleted`));
      } else if (forceDelete) {
        await execAsync(`git branch -D ${forceDelete}`);
        console.log(chalk.green(`✅ Branch '${forceDelete}' force deleted`));
      } else if (move) {
        const [oldName, newName] = move;
        await execAsync(`git branch -m ${oldName} ${newName}`);
        console.log(
          chalk.green(`✅ Branch '${oldName}' renamed to '${newName}'`),
        );
      } else if (branchName) {
        await execAsync(`git branch ${branchName}`);
        console.log(chalk.green(`✅ Branch '${branchName}' created`));
      } else {
        // List branches
        console.log(chalk.blue("🌿 Branches:"));

        const args = ["branch"];
        if (all) args.push("-a");
        else if (remote) args.push("-r");

        const { stdout } = await execAsync(`git ${args.join(" ")}`);
        console.log(this.formatBranchList(stdout));
      }
    } catch (error) {
      console.log(chalk.red(`❌ Branch operation failed: ${error.message}`));
      logger.error("Git branch failed", error);
    }
  }

  /**
   * Checkout branch or files
   */
  async checkoutBranch(target, files, options, _command) {
    const { createBranch, force, track } = options;

    logger.info("Git checkout", { target, files, createBranch, force, track });

    if (!(await this.isGitRepository())) {
      console.log(chalk.red("❌ Not a git repository"));
      return;
    }

    try {
      const args = ["checkout"];

      if (createBranch) args.push("-b");
      if (force) args.push("-f");
      if (track) args.push("--track");

      args.push(target);
      if (files && files.length > 0) args.push(...files);

      const { stdout } = await execAsync(`git ${args.join(" ")}`);

      if (createBranch) {
        console.log(
          chalk.green(`✅ Created and switched to branch '${target}'`),
        );
      } else if (files && files.length > 0) {
        console.log(chalk.green(`✅ Files restored: ${files.join(", ")}`));
      } else {
        console.log(chalk.green(`✅ Switched to branch '${target}'`));
      }

      if (stdout) console.log(stdout);
    } catch (error) {
      console.log(chalk.red(`❌ Checkout failed: ${error.message}`));
      logger.error("Git checkout failed", error);
    }
  }

  /**
   * Add files to staging area
   */
  async addFiles(files, options, _command) {
    const { all, update, patch, dryRun } = options;

    logger.info("Adding files", { files, all, update, patch, dryRun });

    if (!(await this.isGitRepository())) {
      console.log(chalk.red("❌ Not a git repository"));
      return;
    }

    try {
      const args = ["add"];

      if (dryRun) args.push("--dry-run");
      if (all) args.push("-A");
      else if (update) args.push("-u");
      else if (patch) args.push("-p");
      else if (files && files.length > 0) args.push(...files);
      else args.push(".");

      const { stdout } = await execAsync(`git ${args.join(" ")}`);

      if (dryRun) {
        console.log(chalk.blue("📋 Files that would be added:"));
        console.log(stdout);
      } else {
        console.log(chalk.green("✅ Files added to staging area"));
        if (stdout) console.log(stdout);
      }
    } catch (error) {
      console.log(chalk.red(`❌ Add failed: ${error.message}`));
      logger.error("Git add failed", error);
    }
  }

  /**
   * Create a commit
   */
  async createCommit(options, _command) {
    const { message, all, amend, noVerify } = options;

    logger.info("Creating commit", { message, all, amend, noVerify });

    if (!(await this.isGitRepository())) {
      console.log(chalk.red("❌ Not a git repository"));
      return;
    }

    if (!message && !amend) {
      console.log(chalk.red("❌ Commit message required"));
      return;
    }

    try {
      const args = ["commit"];

      if (message) args.push("-m", `"${message}"`);
      if (all) args.push("-a");
      if (amend) args.push("--amend");
      if (noVerify) args.push("--no-verify");

      const { stdout } = await execAsync(`git ${args.join(" ")}`);

      console.log(chalk.green("✅ Commit created"));
      console.log(stdout);
    } catch (error) {
      console.log(chalk.red(`❌ Commit failed: ${error.message}`));
      logger.error("Git commit failed", error);
    }
  }

  // Additional methods for push, pull, remote, stash, tag, merge, rebase, clone, init, clean, gc...
  // (Continuing with remaining implementations)

  async pushChanges(remote, branch, options, _command) {
    const { setUpstream, force, dryRun, tags } = options;

    logger.info("Pushing changes", {
      remote,
      branch,
      setUpstream,
      force,
      dryRun,
      tags,
    });

    if (!(await this.isGitRepository())) {
      console.log(chalk.red("❌ Not a git repository"));
      return;
    }

    try {
      const args = ["push"];

      if (dryRun) args.push("--dry-run");
      if (force) args.push("--force");
      if (setUpstream) args.push("--set-upstream");
      if (tags) args.push("--tags");

      args.push(remote || "origin");
      if (branch) args.push(branch);

      const { stdout } = await execAsync(`git ${args.join(" ")}`);

      if (dryRun) {
        console.log(chalk.blue("📋 Would push:"));
      } else {
        console.log(chalk.green("✅ Changes pushed successfully"));
      }
      console.log(stdout);
    } catch (error) {
      console.log(chalk.red(`❌ Push failed: ${error.message}`));
      logger.error("Git push failed", error);
    }
  }

  async pullChanges(remote, branch, options, _command) {
    const { rebase, ffOnly, noCommit } = options;

    logger.info("Pulling changes", {
      remote,
      branch,
      rebase,
      ffOnly,
      noCommit,
    });

    if (!(await this.isGitRepository())) {
      console.log(chalk.red("❌ Not a git repository"));
      return;
    }

    try {
      const args = ["pull"];

      if (rebase) args.push("--rebase");
      if (ffOnly) args.push("--ff-only");
      if (noCommit) args.push("--no-commit");

      args.push(remote || "origin");
      if (branch) args.push(branch);

      const { stdout } = await execAsync(`git ${args.join(" ")}`);

      console.log(chalk.green("✅ Changes pulled successfully"));
      console.log(stdout);
    } catch (error) {
      console.log(chalk.red(`❌ Pull failed: ${error.message}`));
      logger.error("Git pull failed", error);
    }
  }

  // Helper methods
  async isGitRepository() {
    try {
      await execAsync("git rev-parse --git-dir");
      return true;
    } catch {
      return false;
    }
  }

  async showRepositoryInfo() {
    try {
      const { stdout: branch } = await execAsync("git branch --show-current");
      const { stdout: remote } = await execAsync("git remote -v");

      console.log();
      console.log(chalk.cyan("📍 Current branch:"), chalk.white(branch.trim()));

      if (remote.trim()) {
        console.log(chalk.cyan("🔗 Remotes:"));
        console.log(remote.trim());
      }
    } catch (error) {
      // Ignore errors for additional info
    }
  }

  formatGitStatus(statusOutput) {
    // Format git status output with colors
    return statusOutput
      .split("\n")
      .map((line) => {
        if (line.includes("modified:")) return chalk.yellow(line);
        if (line.includes("new file:")) return chalk.green(line);
        if (line.includes("deleted:")) return chalk.red(line);
        if (line.includes("renamed:")) return chalk.blue(line);
        if (line.includes("Untracked files:")) return chalk.red(line);
        return line;
      })
      .join("\n");
  }

  formatBranchList(branchOutput) {
    return branchOutput
      .split("\n")
      .map((line) => {
        if (line.trim().startsWith("*")) {
          return chalk.green(line); // Current branch
        } else if (line.includes("remotes/")) {
          return chalk.blue(line); // Remote branch
        }
        return chalk.white(line);
      })
      .join("\n");
  }

  // Placeholder methods for remaining functionality
  async manageRemotes(options, _command) {
    console.log(chalk.blue("🔗 Remote management (placeholder)"));
    logger.info("Remote management requested", options);
  }

  async manageStash(options, _command) {
    console.log(chalk.blue("📦 Stash management (placeholder)"));
    logger.info("Stash management requested", options);
  }

  async manageTags(tagName, commit, options, _command) {
    console.log(chalk.blue("🏷️  Tag management (placeholder)"));
    logger.info("Tag management requested", { tagName, commit, options });
  }

  async mergeBranch(branch, options, _command) {
    console.log(chalk.blue("🔀 Branch merge (placeholder)"));
    logger.info("Branch merge requested", { branch, options });
  }

  async rebaseBranch(branch, options, _command) {
    console.log(chalk.blue("📏 Branch rebase (placeholder)"));
    logger.info("Branch rebase requested", { branch, options });
  }

  async cloneRepository(url, directory, options, _command) {
    console.log(chalk.blue("📥 Repository clone (placeholder)"));
    logger.info("Repository clone requested", { url, directory, options });
  }

  async initRepository(directory, options, _command) {
    console.log(chalk.blue("🆕 Repository init (placeholder)"));
    logger.info("Repository init requested", { directory, options });
  }

  async cleanWorkingDirectory(options, _command) {
    console.log(chalk.blue("🧹 Working directory clean (placeholder)"));
    logger.info("Working directory clean requested", options);
  }

  async garbageCollect(options, _command) {
    console.log(chalk.blue("🗑️  Repository cleanup (placeholder)"));
    logger.info("Repository cleanup requested", options);
  }

  getCommand() {
    return this.gitCommand;
  }
}

// Create and export the git command
const gitCommandInstance = new GitCommand();
module.exports = gitCommandInstance.getCommand();
