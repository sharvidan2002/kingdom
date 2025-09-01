import React, { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { Download, ZoomIn, ZoomOut, RotateCcw, Maximize2 } from 'lucide-react'
import { EmptyState } from '../common/ErrorMessage'

const MindMap = ({ data, analysisId, className = '' }) => {
  const svgRef = useRef(null)
  const containerRef = useRef(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)

  useEffect(() => {
    if (!data || !data.central) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove() // Clear previous content

    const container = containerRef.current
    const rect = container.getBoundingClientRect()
    const width = rect.width || 800
    const height = Math.max(400, rect.height || 400)

    svg.attr('width', width).attr('height', height)

    // Create zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.5, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform)
        setZoomLevel(event.transform.k)
      })

    svg.call(zoom)

    const g = svg.append('g')

    // Prepare data for D3 hierarchy
    const hierarchyData = {
      name: data.central,
      children: data.branches?.map(branch => ({
        name: branch.name,
        children: branch.subtopics?.map(subtopic => ({
          name: subtopic
        })) || []
      })) || []
    }

    // Create tree layout
    const tree = d3.tree()
      .size([height - 100, width - 200])
      .separation((a, b) => (a.parent === b.parent ? 1 : 2) / a.depth)

    const root = d3.hierarchy(hierarchyData)
    tree(root)

    // Position root node at center
    root.x = height / 2
    root.y = 100

    // Links
    g.selectAll('.link')
      .data(root.links())
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('d', d3.linkHorizontal()
        .x(d => d.y)
        .y(d => d.x)
      )
      .style('fill', 'none')
      .style('stroke', '#6b7280')
      .style('stroke-width', 2)
      .style('opacity', 0)
      .transition()
      .duration(800)
      .style('opacity', 1)

    // Nodes
    const node = g.selectAll('.node')
      .data(root.descendants())
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.y},${d.x})`)
      .style('cursor', 'pointer')
      .style('opacity', 0)
      .on('click', (event, d) => {
        // Add click interaction if needed
        console.log('Clicked node:', d.data.name)
      })

    // Animate nodes
    node.transition()
      .duration(800)
      .delay((d, i) => i * 100)
      .style('opacity', 1)

    // Node circles
    node.append('circle')
      .attr('r', d => {
        if (d.depth === 0) return 30 // Central node
        if (d.depth === 1) return 20 // Branch nodes
        return 15 // Leaf nodes
      })
      .style('fill', d => {
        if (d.depth === 0) return '#000000' // Central node
        if (d.depth === 1) return '#6b7280' // Branch nodes
        return '#9ca3af' // Leaf nodes
      })
      .style('stroke', '#ffffff')
      .style('stroke-width', 2)
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', d => {
            if (d.depth === 0) return 35
            if (d.depth === 1) return 25
            return 18
          })
      })
      .on('mouseout', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', d => {
            if (d.depth === 0) return 30
            if (d.depth === 1) return 20
            return 15
          })
      })

    // Node labels
    node.append('text')
      .attr('dy', '0.3em')
      .style('text-anchor', 'middle')
      .style('font-size', d => {
        if (d.depth === 0) return '14px'
        if (d.depth === 1) return '12px'
        return '10px'
      })
      .style('font-weight', d => d.depth === 0 ? 'bold' : 'normal')
      .style('fill', d => d.depth === 0 ? '#ffffff' : '#ffffff')
      .style('pointer-events', 'none')
      .text(d => {
        // Truncate long text
        if (d.data.name.length > 15) {
          return d.data.name.substring(0, 15) + '...'
        }
        return d.data.name
      })

    // Add tooltips for truncated text
    node.append('title')
      .text(d => d.data.name)

  }, [data])

  const handleZoomIn = () => {
    const svg = d3.select(svgRef.current)
    svg.transition().call(
      d3.zoom().scaleBy, 1.5
    )
  }

  const handleZoomOut = () => {
    const svg = d3.select(svgRef.current)
    svg.transition().call(
      d3.zoom().scaleBy, 0.75
    )
  }

  const handleReset = () => {
    const svg = d3.select(svgRef.current)
    svg.transition().call(
      d3.zoom().transform,
      d3.zoomIdentity
    )
  }

  const handleDownload = () => {
    const svg = svgRef.current
    const serializer = new XMLSerializer()
    const svgString = serializer.serializeToString(svg)
    const blob = new Blob([svgString], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = `mindmap-${analysisId || 'analysis'}.svg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  if (!data || !data.central) {
    return (
      <EmptyState
        icon={<Brain className="w-full h-full" />}
        title="No Mind Map Available"
        description="No mind map data was generated for this analysis."
      />
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Controls */}
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div>
          <h3 className="font-semibold">Mind Map</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Interactive visualization of key concepts and relationships
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleZoomOut}
            className="btn btn-secondary text-sm"
            aria-label="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <button
            onClick={handleReset}
            className="btn btn-secondary text-sm"
            aria-label="Reset view"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={handleZoomIn}
            className="btn btn-secondary text-sm"
            aria-label="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <button
            onClick={toggleFullscreen}
            className="btn btn-secondary text-sm"
            aria-label="Toggle fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          <button
            onClick={handleDownload}
            className="btn btn-secondary text-sm"
            aria-label="Download mind map"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mind Map Container */}
      <div
        ref={containerRef}
        className={`
          border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 overflow-hidden
          ${isFullscreen ? 'fixed inset-4 z-50' : 'h-96'}
        `}
      >
        <svg
          ref={svgRef}
          className="w-full h-full"
          style={{ background: isFullscreen ? '#ffffff' : 'transparent' }}
        />

        {/* Zoom indicator */}
        {zoomLevel !== 1 && (
          <div className="absolute top-4 left-4 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
            {Math.round(zoomLevel * 100)}%
          </div>
        )}

        {/* Fullscreen close button */}
        {isFullscreen && (
          <button
            onClick={toggleFullscreen}
            className="absolute top-4 right-4 bg-black bg-opacity-70 text-white p-2 rounded-lg hover:bg-opacity-90 transition-colors"
            aria-label="Exit fullscreen"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Legend */}
      <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
        <p>• Large circle: Main topic</p>
        <p>• Medium circles: Key concepts</p>
        <p>• Small circles: Subtopics</p>
        <p>• Click and drag to pan, scroll to zoom</p>
      </div>

      {/* Mind Map Data Preview */}
      <div className="card p-4">
        <h4 className="font-medium mb-3">Concept Breakdown</h4>
        <div className="space-y-3">
          <div className="text-center p-3 bg-black text-white dark:bg-white dark:text-black rounded-lg">
            <div className="font-bold">{data.central}</div>
            <div className="text-sm opacity-75">Central Topic</div>
          </div>

          {data.branches && data.branches.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {data.branches.map((branch, index) => (
                <div key={index} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="font-medium mb-2">{branch.name}</div>
                  {branch.subtopics && branch.subtopics.length > 0 && (
                    <div className="space-y-1">
                      {branch.subtopics.map((subtopic, subIndex) => (
                        <div key={subIndex} className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                          • {subtopic}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MindMap