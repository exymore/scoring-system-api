import * as d3 from 'd3';

export function buildRadialTidyTree(data) {
  const svg = d3.select('#radialTidyTree');
  const tree = d3.cluster().size([2 * Math.PI, 600]);
  const root = tree(
    d3.hierarchy(data).sort((a, b) => d3.ascending(a.data.name, b.data.name))
  );

  const link = svg
    .append('g')
    .attr('fill', 'none')
    .attr('stroke', '#555')
    .attr('stroke-opacity', 0.4)
    .attr('stroke-width', 1.5)
    .selectAll('path')
    .data(root.links())
    .join('path')
    .attr(
      'd',
      d3
        .linkRadial()
        .angle(d => d.x)
        .radius(d => d.y)
    );

  const node = svg
    .append('g')
    .attr('stroke-linejoin', 'round')
    .attr('stroke-width', 3)
    .selectAll('g')
    .data(root.descendants().reverse())
    .join('g')
    .attr(
      'transform',
      d => `
        rotate(${(d.x * 180) / Math.PI - 90})
        translate(${d.y},0)
      `
    );

  node
    .append('circle')
    .attr('fill', d => (d.children ? '#555' : '#999'))
    .attr('r', 2.5);

  node
    .append('text')
    .attr('dy', '0.31em')
    .attr('x', d => (d.x < Math.PI === !d.children ? 6 : -6))
    .attr('text-anchor', d => (d.x < Math.PI === !d.children ? 'start' : 'end'))
    .attr('transform', d => (d.x >= Math.PI ? 'rotate(180)' : null))
    .text(d => d.data.name)
    .clone(true)
    .lower()
    .attr('stroke', 'white');

  svg.node();

  function autoBox() {
    const { x, y, width, height } = this.getBBox();
    return [x, y, width, height];
  }

  svg.attr('viewBox', autoBox);
}

export function buildCollapsibleTree(data) {
  const svg = d3.select('#collapsibleTree');

  const margin = {
    top: 10,
    right: 120,
    bottom: 10,
    left: 100,
  };

  const dy = 150;
  const dx = 30;
  const tree = d3.tree().nodeSize([dx, dy]);

  const diagonal = d3
    .linkHorizontal()
    .x(d => d.y)
    .y(d => d.x);

  const root = d3.hierarchy(data);

  root.x0 = dy / 2;
  root.y0 = 0;

  root.descendants().forEach((d, i) => {
    d.id = i;
    d._children = d.children;
    if (d.depth && d.data.name.length !== 7) d.children = null;
  });

  const gLink = svg
    .append('g')
    .attr('fill', 'none')
    .attr('stroke', '#555')
    .attr('stroke-opacity', 0.4)
    .attr('stroke-width', 1.5);

  const gNode = svg
    .append('g')
    .attr('cursor', 'pointer')
    .attr('pointer-events', 'all');

  function update(source) {
    const duration = d3.event && d3.event.altKey ? 2500 : 250;
    const nodes = root.descendants().reverse();
    const links = root.links();

    // Compute the new tree layout.
    tree(root);

    let left = root;
    let right = root;
    root.eachBefore(node => {
      if (node.x < left.x) left = node;
      if (node.x > right.x) right = node;
    });

    const transition = svg
      .transition()
      .duration(duration)
      .attr(
        'height',
        Math.sqrt(gNode.selectAll('g').data(nodes, d => d.id)._groups[0].length) * 100
      )
      .attr('viewBox', [
        -margin.left,
        left.x - margin.top,
        // eslint-disable-next-line no-restricted-properties
        gNode.selectAll('g').data(nodes, d => d.id)._groups[0].length * 75 + 200,
        Math.sqrt(gNode.selectAll('g').data(nodes, d => d.id)._groups[0].length) * 100,
      ]);

    // Update the nodes…
    const node = gNode.selectAll('g').data(nodes, d => d.id);

    // Enter any new nodes at the parent's previous position.
    const nodeEnter = node
      .enter()
      .append('g')
      .attr('transform', d => `translate(${source.y0},${source.x0})`)
      .attr('fill-opacity', 0)
      .attr('stroke-opacity', 0)
      .on('click', d => {
        d.children = d.children ? null : d._children;
        update(d);
      });

    nodeEnter
      .append('circle')
      .attr('r', 2.5)
      .attr('fill', d => (d._children ? '#555' : '#999'))
      .attr('stroke-width', 10);

    nodeEnter
      .append('text')
      .attr('dy', '0.31em')
      .attr('x', d => (d._children ? -6 : 6))
      .attr('text-anchor', d => (d._children ? 'end' : 'start'))
      .text(d => d.data.name)
      .clone(true)
      .lower()
      .attr('stroke-linejoin', 'round')
      .attr('stroke-width', 3)
      .attr('stroke', 'white');

    // Transition nodes to their new position.
    const nodeUpdate = node
      .merge(nodeEnter)
      .transition(transition)
      .attr('transform', d => `translate(${d.y},${d.x})`)
      .attr('fill-opacity', 1)
      .attr('stroke-opacity', 1);

    // Transition exiting nodes to the parent's new position.
    const nodeExit = node
      .exit()
      .transition(transition)
      .remove()
      .attr('transform', d => `translate(${source.y},${source.x})`)
      .attr('fill-opacity', 0)
      .attr('stroke-opacity', 0);

    // Update the links…
    const link = gLink.selectAll('path').data(links, d => d.target.id);

    // Enter any new links at the parent's previous position.
    const linkEnter = link
      .enter()
      .append('path')
      .attr('d', d => {
        const o = { x: source.x0, y: source.y0 };
        return diagonal({ source: o, target: o });
      });

    // Transition links to their new position.
    link
      .merge(linkEnter)
      .transition(transition)
      .attr('d', diagonal);

    // Transition exiting nodes to the parent's new position.
    link
      .exit()
      .transition(transition)
      .remove()
      .attr('d', d => {
        const o = { x: source.x, y: source.y };
        return diagonal({ source: o, target: o });
      });

    // Stash the old positions for transition.
    root.eachBefore(d => {
      d.x0 = d.x;
      d.y0 = d.y;
    });
  }

  update(root);

  return svg.node();
}
