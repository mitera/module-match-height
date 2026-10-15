import { readFileSync } from 'node:fs';
import typescript from 'typescript';
import rollupTypescript from '@rollup/plugin-typescript';

// Read package metadata so the banner and output path stay in sync with package.json
const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));

// Derive "owner/repo" from the repository URL (e.g. git+https://github.com/mitera/module-match-height.git)
const repoUrl = (typeof pkg.repository === 'string' ? pkg.repository : pkg.repository.url)
    .replace(/^git\+/, '')
    .replace(/\.git$/, '');
const owner = new URL(repoUrl).pathname.split('/')[1];

const license = `/*!
 * @author ${pkg.author}
 * ${pkg.name} v${pkg.version} by @${owner}
 * ${repoUrl}
 * Released under the ${pkg.license} License.
 */`;

export default {
    input: `./src/${pkg.name}.ts`,
    output: [
        {
            file: pkg.main,
            format: 'umd',
            name: 'MatchHeight',
            banner: license,
            indent: '\t',
        }
    ],
    plugins: [
        rollupTypescript( { typescript } ),
    ],
};
