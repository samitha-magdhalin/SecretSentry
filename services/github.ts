import { GithubRepo, GithubUser } from '../types';

export class GitHubService {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  private async fetchWithAuth(url: string, options: RequestInit = {}) {
    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `token ${this.token}`,
        Accept: 'application/vnd.github.v3+json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      let errorMessage = 'GitHub API request failed';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        // Fallback if response is not JSON
      }

      if (response.status === 401) {
        throw new Error('GITHUB_INVALID_TOKEN: Your GitHub token is invalid or has expired.');
      }

      if (response.status === 403 && errorMessage.toLowerCase().includes('rate limit')) {
        throw new Error('GITHUB_RATE_LIMIT: You have exceeded the GitHub API rate limit. Please try again later.');
      }

      throw new Error(errorMessage);
    }

    return response.json();
  }

  async getUser(): Promise<GithubUser> {
    return this.fetchWithAuth('https://api.github.com/user');
  }

  async getRepos(): Promise<GithubRepo[]> {
    return this.fetchWithAuth('https://api.github.com/user/repos?sort=updated&per_page=100');
  }

  async getRepoFiles(fullName: string, path: string = ''): Promise<any[]> {
    return this.fetchWithAuth(`https://api.github.com/repos/${fullName}/contents/${path}`);
  }

  async getFileContent(fullName: string, path: string): Promise<string> {
    const data = await this.fetchWithAuth(`https://api.github.com/repos/${fullName}/contents/${path}`);
    if (data.encoding === 'base64') {
      return atob(data.content.replace(/\n/g, ''));
    }
    return data.content;
  }

  async getCommitInfo(fullName: string, path: string): Promise<{hash: string, author: string, date: string} | null> {
    try {
      const commits = await this.fetchWithAuth(`https://api.github.com/repos/${fullName}/commits?path=${path}&per_page=1`);
      if (commits && commits.length > 0) {
        return {
          hash: commits[0].sha,
          author: commits[0].commit.author.name,
          date: commits[0].commit.author.date
        };
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  async createIssue(fullName: string, title: string, body: string): Promise<void> {
    await this.fetchWithAuth(`https://api.github.com/repos/${fullName}/issues`, {
      method: 'POST',
      body: JSON.stringify({ title, body }),
    });
  }

  async getAllFiles(fullName: string): Promise<{path: string, url: string}[]> {
    try {
      const repoInfo = await this.fetchWithAuth(`https://api.github.com/repos/${fullName}`);
      const branch = repoInfo.default_branch || 'main';
      
      const treeData = await this.fetchWithAuth(
        `https://api.github.com/repos/${fullName}/git/trees/${branch}?recursive=1`
      );

      const skipExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.pdf', '.zip', '.exe', '.ico', '.svg', '.woff', '.woff2'];
      const skipDirs = ['node_modules', '.git', 'dist', 'build', '.next', '.cache'];

      const files = treeData.tree
        .filter((item: any) => 
          item.type === 'blob' && 
          !skipExtensions.some(ext => item.path.toLowerCase().endsWith(ext)) &&
          !skipDirs.some(dir => item.path.includes(dir))
        )
        .slice(0, 100) 
        .map((item: any) => ({
          path: item.path,
          url: item.url
        }));

      return files;
    } catch (error) {
      if (error.message.includes('GITHUB_RATE_LIMIT') || error.message.includes('GITHUB_INVALID_TOKEN')) {
        throw error;
      }
      return this.getAllFilesLegacy(fullName);
    }
  }

  private async getAllFilesLegacy(fullName: string, path: string = '', depth = 0): Promise<{path: string, url: string}[]> {
    if (depth > 3) return []; 
    
    const contents = await this.getRepoFiles(fullName, path);
    let files: {path: string, url: string}[] = [];

    for (const item of contents) {
      if (item.type === 'file') {
        const skipExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.pdf', '.zip', '.exe'];
        if (!skipExtensions.some(ext => item.name.toLowerCase().endsWith(ext))) {
          files.push({ path: item.path, url: item.url });
        }
      } else if (item.type === 'dir' && !['node_modules', '.git', 'dist'].includes(item.name)) {
        const subFiles = await this.getAllFilesLegacy(fullName, item.path, depth + 1);
        files = [...files, ...subFiles];
      }
      if (files.length > 50) break;
    }
    return files;
  }
}