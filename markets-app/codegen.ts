import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  // Schema source will be updated when backend is ready
  // For now, use a placeholder schema file
  schema: './graphql/schema.graphql',
  documents: ['./graphql/queries/**/*.graphql', './graphql/mutations/**/*.graphql'],
  generates: {
    './graphql/generated/': {
      preset: 'client',
      config: {
        strictScalars: true,
        enumsAsTypes: true,
      },
    },
  },
};

export default config;
