import pkg from './package.json' assert { type: "json" };
import typescript from 'typescript';
import rollupTypescript from '@rollup/plugin-typescript';

const license = `/*!
 * @author Simone Miterangelis <simone@mite.it>
 * vanilla-match-height v1.0.0 by @mitera
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
        },
        {
            dir: 'dist',
            format: 'es',
            //file: pkg.module,
            banner: license,
            indent: '\t',
        }
    ],
    plugins: [
        rollupTypescript( { typescript } ),
    ],
};