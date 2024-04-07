import React from "../core/React.js";

let count = 0;
let props = {
  id: 1,
};

let fooCount = 1;
function Foo() {
  const update = React.update();
  function handleClick() {
    console.log("fooCount++");
    fooCount++;
    update();
  }

  return (
    <div>
      <h1>Foo</h1>
      Foo-{fooCount}
      <button onClick={handleClick}>Foo-button</button>
    </div>
  );
}

let barCount = 1;
function Bar() {
  const update = React.update();
  function handleClick() {
    console.log("barCount++");
    barCount++;
    update();
  }
  return (
    <div>
      <h1>Bar</h1>Bar-{barCount}
      <button onClick={handleClick}>Bar-button</button>
    </div>
  );
}

let rootCount = 1;
function App() {
  const update = React.update();
  function handleClick() {
    rootCount++;
    update();
  }
  return (
    <div id="app">
      mini-react
      <button onClick={handleClick}>{rootCount}</button>
      <Bar />
      <Foo />
      <div>222</div>
    </div>
  );
}

export default App;
