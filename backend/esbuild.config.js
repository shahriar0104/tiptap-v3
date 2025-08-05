import esbuild from 'esbuild';

const isProduction = process.env.NODE_ENV === 'production';

const buildOptions = {
  entryPoints: ['src/index.js'],
  bundle: true,
  platform: 'node',
  target: 'node18',
  format: 'esm',
  outfile: 'dist/index.js',
  sourcemap: !isProduction,
  minify: isProduction,
  external: [
    // External dependencies that shouldn't be bundled
    'prisma',
    '@prisma/client',
    'pg',
    'pg-native',
  ],
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
  },
  loader: {
    '.js': 'jsx',
  },
  plugins: [
    // Custom plugin to handle Prisma client
    {
      name: 'prisma-client',
      setup(build) {
        build.onResolve({ filter: /^@prisma\/client$/ }, () => {
          return { external: true };
        });
      },
    },
  ],
};

// Build function
async function build() {
  try {
    if (process.argv.includes('--watch')) {
      const context = await esbuild.context(buildOptions);
      await context.watch();
      console.log('🔧 esbuild watching for changes...');
    } else {
      await esbuild.build(buildOptions);
      console.log('✅ Build completed successfully!');
    }
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

build(); 