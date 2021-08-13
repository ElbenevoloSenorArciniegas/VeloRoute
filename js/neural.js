function analizarRedNeural(){

  // create a simple feed forward neural network with backpropagation
  const net = new brain.NeuralNetwork();
  
  net.train([
    /*{ input: [0, 0, 0.005, 0.2, 0.008, 0.4, 0.013, 0.7, 0.022, 0.1], output: [0.008,0.022] },*/
    { input: [0, 0, 0.022, 0.1], output: [0,0.022] },
    { input: [0.01, 0, 0.034, 0.6], output: [0.034,0.034] },
    { input: [0.054, 0.4, 0.076, 0.4], output: [0.054,0.076] },
    { input: [0, 0, 0.022, 0.1], output: [0,0.022] },
    { input: [0.01, 0, 0.034, 0.6], output: [0.034,0.034] },
    { input: [0.054, 0.4, 0.076, 0.4], output: [0.054,0.076] },
    { input: [0, 0, 0.022, 0.1], output: [0,0.022] },
    { input: [0.01, 0, 0.034, 0.6], output: [0.034,0.034] },
    { input: [0.054, 0.4, 0.076, 0.4], output: [0.054,0.076] },
    { input: [0, 0, 0.022, 0.1], output: [0,0.022] },
    { input: [0.01, 0, 0.034, 0.6], output: [0.034,0.034] },
    { input: [0.054, 0.4, 0.076, 0.4], output: [0.054,0.076] },
    { input: [0, 0, 0.022, 0.1], output: [0,0.022] },
    { input: [0.01, 0, 0.034, 0.6], output: [0.034,0.034] },
    { input: [0.054, 0.4, 0.076, 0.4], output: [0.054,0.076] },
    { input: [0, 0, 0.022, 0.1], output: [0,0.022] },
    { input: [0.01, 0, 0.034, 0.6], output: [0.034,0.034] },
    { input: [0.054, 0.4, 0.076, 0.4], output: [0.054,0.076] },
  ]);
  
  const output = net.run([0.042, 0.1, 0.088, 0.4]); // [0.042,0.088]
  
  console.log(output);
}

/*function analizarKMeans(data, k = 1){
  const centroids = data.slice(0, k);
  const distances = Array.from({ length: data.length }, () =>
    Array.from({ length: k }, () => 0)
  );
  const classes = Array.from({ length: data.length }, () => -1);
  let itr = true;

  while (itr) {
    itr = false;

    for (let d in data) {
      for (let c = 0; c < k; c++) {
        distances[d][c] = Math.hypot(
          ...Object.keys(data[0]).map(key => data[d][key] - centroids[c][key])
        );
      }
      const m = distances[d].indexOf(Math.min(...distances[d]));
      if (classes[d] !== m) itr = true;
      classes[d] = m;
    }

    for (let c = 0; c < k; c++) {
      centroids[c] = Array.from({ length: data[0].length }, () => 0);
      const size = data.reduce((acc, _, d) => {
        if (classes[d] === c) {
          acc++;
          for (let i in data[0]) centroids[c][i] += data[d][i];
        }
        return acc;
      }, 0);
      for (let i in data[0]) {
        centroids[c][i] = parseFloat(Number(centroids[c][i] / size).toFixed(2));
      }
    }
  }

  return classes;
}*/
