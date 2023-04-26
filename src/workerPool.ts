const N_WORKERS = 4;
const workers: Array<WorkerConstruct> = [];
let messageCount = 0;

type WorkerConstruct = {
  instance: Worker;
  idle: boolean;
};

for (let i = 0; i < N_WORKERS; i++) {
  workers[i] = {
    instance: new Worker(new URL("./worker.ts", import.meta.url)),
    idle: true,
  };
}

workers.forEach((worker) => {
  worker.instance.addEventListener("message", (e) => {
    worker.idle = true;

    if (workerController.callback) {
      workerController.callback(e);
    }
  });
});

type MessageCallback = (e: MessageEvent<any>) => void;

type WorkerController = {
  postMessage: (message: any, transferables?: Transferable[]) => void;
  callback?: MessageCallback;
};

// const findAvailableWorker = () => {
//   let count = 0;
//   workers.forEach((worker) => {
//     if (worker.idle) {
//       count++;
//     }
//   });
//   console.log(count);
// };

export const workerController: WorkerController = {
  postMessage: (message, transferables) => {
    // findAvailableWorker();
    let worker = workers[messageCount % N_WORKERS];

    worker.idle = false;
    worker.instance.postMessage(message, transferables ? transferables : []);

    messageCount++;
  },
};
