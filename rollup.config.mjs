import typescript from 'typescript';
import rollupTypescript from '@rollup/plugin-typescript';

const license = `/*!
 * @author Simone Miterangelis <simone@mite.it>
 * module-match-height v1.0.2 by @mitera
 * https://github.com/mitera/module-match-height
 * Released under the MIT License.
 */`;

export default {
    input: './src/module-match-height.ts',
    output: [
        {
            dir: 'dist',
            format: 'umd',
            name: 'MatchHeight',
            //file: pkg.main,
            banner: license,
            indent: '\t',
        }
    ],
    plugins: [
        rollupTypescript( { typescript } ),
    ],
};