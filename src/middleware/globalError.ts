export const setupGlobalErrorHandler = () => {
  process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
  });

  process.on('uncaughtRejection', (reason, promise) => {
    console.error('Uncaught Rejection:', reason);
  });
};
