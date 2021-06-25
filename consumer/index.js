const { Worker } = require('worker_threads');
let fs = require('fs');
let logFilePath = 'total.txt';

try {
  let worker1 = new Worker('./worker.js');
  worker1.on('error', (error) => {
    console.log(error);
  });

  worker1.on('exit', (exitCode) => {
    console.log(exitCode);
  });

  //Listen for a message from worker
  worker1.on('message', (result) => {
    let total = fs.readFileSync(logFilePath, { encoding: 'utf-8' });
    if (!total) {
      fs.writeFileSync(logFilePath, '0', { encoding: 'utf-8' });
    } else {
      total = parseInt(total) + result;
      fs.writeFileSync(logFilePath, total.toString(), { encoding: 'utf-8' });
      console.log('total ', total);
    }
  });

  let worker2 = new Worker('./worker.js');
  worker2.on('error', (error) => {
    console.log(error);
  });

  worker2.on('exit', (exitCode) => {
    console.log(exitCode);
  });

  //Listen for a message from worker
  worker2.on('message', (result) => {
    
    let total = fs.readFileSync(logFilePath, { encoding: 'utf-8' });
    if (!total) {
      fs.writeFileSync(logFilePath, '0', { encoding: 'utf-8' });
    } else {
      total = parseInt(total) + result;
      fs.writeFileSync(logFilePath, total.toString(), { encoding: 'utf-8' });
      console.log('total ', total);
    }
  });

#  let worker3 = new Worker('./worker.js');
 # worker3.on('error', (error) => {
  #  console.log(error);
 # });

  #worker3.on('exit', (exitCode) => {
   # console.log(exitCode);
  #});

  //Listen for a message from worker
 # worker3.on('message', (result) => {
    
  #  let total = fs.readFileSync(logFilePath, { encoding: 'utf-8' });
   # if (!total) {
    #  fs.writeFileSync(logFilePath, '0', { encoding: 'utf-8' });
    #} else {
     # total = parseInt(total) + result;
     # fs.writeFileSync(logFilePath, total.toString(), { encoding: 'utf-8' });
      #console.log('total ', total);
    #}
  #});

  #let worker4 = new Worker('./worker.js');
  #worker4.on('error', (error) => {
   # console.log(error);
  #});

  #worker4.on('exit', (exitCode) => {
   # console.log(exitCode);
  #});

  //Listen for a message from worker
  #worker4.on('message', (result) => {
  
   # let total = fs.readFileSync(logFilePath, { encoding: 'utf-8' });
    #if (!total) {
     # fs.writeFileSync(logFilePath, '0', { encoding: 'utf-8' });
    #} else {
     # total = parseInt(total) + result;
      #fs.writeFileSync(logFilePath, total.toString(), { encoding: 'utf-8' });
      #console.log('total ', total);
   # }
  #});

  #let worker5 = new Worker('./worker.js');
 # worker5.on('error', (error) => {
  #  console.log(error);
 # });

  #worker5.on('exit', (exitCode) => {
   # console.log(exitCode);
 # });

  //Listen for a message from worker
  #worker5.on('message', (result) => {
    
   # let total = fs.readFileSync(logFilePath, { encoding: 'utf-8' });
    #if (!total) {
     # fs.writeFileSync(logFilePath, '0', { encoding: 'utf-8' });
    #} else {
     # total = parseInt(total) + result;
      #fs.writeFileSync(logFilePath, total.toString(), { encoding: 'utf-8' });
      #console.log('total ', total);
    #}
  #});
} catch (error) {
  console.log(error.message);
  throw new Error(error);
}
