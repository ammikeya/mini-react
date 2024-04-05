import React from "../core/React.js";

let count = 0;
let props = {
  id: 1,
};
function TextNum({ num }) {
  function handleCount() {
    console.log("count");
    count++;
    props = {};
    React.update();
  }
  return (
    <div {...props} onClick={handleCount}>
      num: {count}
    </div>
  );
}
function Counter() {
  return <TextNum num={2} />;
}
function App() {
  return (
    <div id="app">
      mini-react
      <Counter></Counter>
    </div>
  );
}

export default App;
