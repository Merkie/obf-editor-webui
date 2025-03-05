import { render } from "solid-js/web";
import { Router, Route } from "@solidjs/router";
import "./index.css";
import Home from "./routes/Home";
import TWM from "./routes/TWM";

render(
  () => (
    <Router>
      <Route path="/" component={Home} />
      <Route path="/twm" component={TWM} />
    </Router>
  ),
  document.getElementById("app")!
);
