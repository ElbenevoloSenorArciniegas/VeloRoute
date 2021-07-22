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