import { Octokit } from '@octokit/rest';

const getPlatformIdentifier = () => {
  const arch = process.arch === 'x64' ? 'amd64' : process.arch;
  return process.platform === 'win32'
    ? `windows-${arch}.exe`
    : `${process.platform}-${arch}`;
};

/**
 * Download mkcert from github.com
 */
export class GithubSource {
  async getSourceInfo() {
    const octokit = new Octokit();
    const { data } = await octokit.repos.getLatestRelease({
      owner: 'FiloSottile',
      repo: 'mkcert'
    })
    const platformIdentifier = getPlatformIdentifier();

    const version = data.tag_name;
    const downloadUrl = data.assets.find((item) => item.name.includes(platformIdentifier))?.browser_download_url;

    if (!(version && downloadUrl)) {
      return undefined;
    }

    return {
      downloadUrl,
      version,
    };
  }
}
