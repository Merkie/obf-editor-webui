import { render } from "solid-js/web";
import { Router, Route } from "@solidjs/router";
import Home from "./routes/Home";
import "./index.css";

render(
  () => (
    <Router>
      <Route path="/" component={Home} />
    </Router>
  ),
  document.getElementById("app")!
);
