import { initializeSystem } from './services/init.service';

initializeSystem()
  .then(() => {
    console.log('Done');
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
