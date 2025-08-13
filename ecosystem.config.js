module.exports = {
  apps: [
    {
      name: 'backend',
      script: 'src/index.ts',
      watch: true,
      interpreter: 'node',
      node_args: '-r ts-node/register',
    },
  ],
};
