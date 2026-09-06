const isMobileLayout = window.matchMedia("(max-width: 768px)").matches;

const chartOptions = {
  width: window.innerWidth * (isMobileLayout ? 0.7 : 0.8),
  height: window.innerHeight,
  padding: 3,
  colorDomain: [0, 5],
  colorRange: ["hsl(152,80%,80%)", "hsl(228,30%,10%)"],
  groupFill: "transparent",
  leafFill: "#35b1b4",
  hoverStroke: "yellow",
  strokeWidth: "2px",
  labelFont: "bold 1rem monospace",
  labelSizeMultiplier: 0.3,
  labelFill: "yellow",
  labelWritingMode: "vertical-rl",
  labelTextOrientation: "upright",
  labelRotationDuration: 12,
  transitionDuration: 750,
  slowTransitionDuration: 7500,
};

fetch("./assets/circle-packing.json")
  .then((response) => {
    if (!response.ok) throw new Error("Could not load circle-packing data.");
    return response.json();
  })
  .then((data) => {
    const { width, height } = chartOptions;
    const color = d3
      .scaleLinear()
      .domain(chartOptions.colorDomain)
      .range(chartOptions.colorRange)
      .interpolate(d3.interpolateHcl);
    // d3.pack() always places sibling circles horizontally first, regardless of
    // container aspect ratio. To lean the layout top-to-bottom on mobile, pack
    // into a landscape rect (where that horizontal placement has room to work)
    // then rotate the whole computed layout 90° into the portrait canvas.
    const packWidth = isMobileLayout ? height : width;
    const packHeight = isMobileLayout ? width : height;
    const root = d3
      .pack()
      .size([packWidth, packHeight])
      .padding(chartOptions.padding)(
      d3
        .hierarchy(data)
        .sum((node) => node.value)
        .sort((first, second) => second.value - first.value),
    );
    if (isMobileLayout) {
      root.each((entry) => {
        const rotatedX = packHeight - entry.y;
        const rotatedY = entry.x;
        entry.x = rotatedX;
        entry.y = rotatedY;
      });
    }
    const svg = d3
      .create("svg")
      .attr("viewBox", `-${width / 2} -${height / 2} ${width} ${height}`)
      .attr("role", "img")
      .attr("aria-label", "Interactive CCSante community circle packing chart");
    const node = svg
      .append("g")
      .selectAll("circle")
      .data(root.descendants().slice(1))
      .join("circle")
      .attr("stroke-width", chartOptions.strokeWidth)
      .attr("fill", (node) =>
        node.children
          ? node.depth == 0
            ? color(node.depth)
            : color(node.depth) //chartOptions.groupFill
          : chartOptions.leafFill,
      )
      .attr("cursor", (node) => (node.data.url ? "pointer" : null))
      .on("mouseover", function (event, hoveredNode) {
        d3.select(this).attr("stroke", chartOptions.hoverStroke);
        label
          .filter((entry) => entry === hoveredNode)
          .style("display", "inline")
          .style("fill-opacity", 1);
      })
      .on("mouseout", function (event, hoveredNode) {
        d3.select(this).attr("stroke", null);
        if (hoveredNode.parent !== focus && hoveredNode !== focus) {
          label
            .filter((entry) => entry === hoveredNode)
            .style("fill-opacity", 0)
            .style("display", "none");
        }
      })
      .on("click", (event, node) => {
        if (node.data.url) {
          window.open(node.data.url, "_blank", "noopener,noreferrer");
          event.stopPropagation();
        } else if (focus !== node) {
          zoom(event, node);
          event.stopPropagation();
        }
      });
    node.append("title").text((entry) => entry.data.name);

    const label = svg
      .append("g")
      .attr("pointer-events", "none")
      .attr("text-anchor", "middle")
      .selectAll("text")
      .data(root.descendants())
      .join("text")
      .style("display", (node) => (node.parent === root ? "inline" : "none"))
      .style("fill-opacity", (node) => (node.parent === root ? 1 : 0))
      .style("user-select", "none")
      .style("font", chartOptions.labelFont)
      .style("font-size", (node) => node.r * chartOptions.labelSizeMultiplier)
      .style("fill", chartOptions.labelFill)
      .style("writing-mode", chartOptions.labelWritingMode)
      .style("text-orientation", chartOptions.labelTextOrientation)
      .text((node) => node.data.name);

    const labelRotation = label
      .append("animateTransform")
      .attr("attributeName", "transform")
      .attr("type", "rotate")
      .attr("values", () => {
        const startAngle = Math.random() * 360;
        const direction = Math.random() < 0.5 ? -1 : 1;
        return `${startAngle} 0 0;${startAngle + direction * 360} 0 0`;
      })
      .attr("dur", `${chartOptions.labelRotationDuration}s`)
      .attr("repeatCount", "indefinite")
      .attr("additive", "sum");

    let focus = root;
    let view;
    // Fitting to the narrower dimension leaves dead space on the longer axis;
    // fill the longer axis instead and let the shorter one crop slightly.
    const fitSize = isMobileLayout ? Math.max(width, height) : width;

    function zoomTo(nextView) {
      const scale = fitSize / nextView[2];
      view = nextView;
      label.attr(
        "transform",
        (entry) =>
          `translate(${(entry.x - nextView[0]) * scale},${(entry.y - nextView[1]) * scale})`,
      );
      node.attr(
        "transform",
        (entry) =>
          `translate(${(entry.x - nextView[0]) * scale},${(entry.y - nextView[1]) * scale})`,
      );
      node.attr("r", (entry) => entry.r * scale);
    }

    function zoom(event, nextFocus) {
      focus = nextFocus;
      const isVisibleLabel = (entry) =>
        entry.parent === focus || (!focus.children && entry === focus);
      const transition = svg
        .transition()
        .duration(
          event.altKey
            ? chartOptions.slowTransitionDuration
            : chartOptions.transitionDuration,
        )
        .tween("zoom", () => {
          const interpolate = d3.interpolateZoom(view, [
            focus.x,
            focus.y,
            focus.r * 2,
          ]);
          return (time) => zoomTo(interpolate(time));
        });

      label
        .filter(function (d) {
          return isVisibleLabel(d) || this.style.display === "inline";
        })
        .transition(transition)
        .style("fill-opacity", (entry) => (isVisibleLabel(entry) ? 1 : 0))
        .on("start", function (entry) {
          if (isVisibleLabel(entry)) {
            this.style.display = "inline";
          }
        })
        .on("end", function (entry) {
          if (!isVisibleLabel(entry)) {
            this.style.display = "none";
          }
        });
    }

    svg.on("click", (event) => zoom(event, root));
    zoomTo([focus.x, focus.y, focus.r * 2]);
    document.querySelector("#circle-packing").append(svg.node());
    // Mobile WebKit defers SMIL restarts until after the element is painted, so
    // wait a frame (not just a tick) before kicking off the rotation.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        labelRotation.each(function () {
          if (typeof this.beginElement === "function") this.beginElement();
        });
      });
    });
  })
  .catch((error) => console.error(error));
