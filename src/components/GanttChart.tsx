import React, { useEffect, useRef } from 'react'
import { Box, Paper, Typography, Alert } from '@mui/material'

interface GanttTask {
  id: string
  text: string
  start_date: Date
  end_date: Date
  progress: number
  parent?: string
  type?: string
  color?: string
}

interface GanttChartProps {
  tasks: GanttTask[]
  height?: number
}

const GanttChart: React.FC<GanttChartProps> = ({ tasks, height = 400 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current || !tasks.length) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Configurações do canvas
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    
    canvas.width = rect.width * dpr
    canvas.height = height * dpr
    ctx.scale(dpr, dpr)
    
    canvas.style.width = rect.width + 'px'
    canvas.style.height = height + 'px'

    // Limpar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Configurações
    const padding = 20
    const barHeight = 30
    const barSpacing = 10
    const timelineHeight = 60
    const chartHeight = height - timelineHeight - padding * 2

    // Encontrar datas mínimas e máximas
    const allDates = tasks.flatMap(task => [task.start_date, task.end_date])
    const minDate = new Date(Math.min(...allDates.map(d => d.getTime())))
    const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())))
    
    // Adicionar margem de 10% nas datas
    const timeRange = maxDate.getTime() - minDate.getTime()
    const margin = timeRange * 0.1
    const adjustedMinDate = new Date(minDate.getTime() - margin)
    const adjustedMaxDate = new Date(maxDate.getTime() + margin)

    // Função para converter data para posição X
    const dateToX = (date: Date) => {
      const totalRange = adjustedMaxDate.getTime() - adjustedMinDate.getTime()
      const datePosition = date.getTime() - adjustedMinDate.getTime()
      return padding + (datePosition / totalRange) * (canvas.width / dpr - padding * 2)
    }

    // Função para converter posição X para data
    const xToDate = (x: number) => {
      const totalRange = adjustedMaxDate.getTime() - adjustedMinDate.getTime()
      const position = (x - padding) / (canvas.width / dpr - padding * 2)
      return new Date(adjustedMinDate.getTime() + position * totalRange)
    }

    // Desenhar timeline
    ctx.fillStyle = '#f5f5f5'
    ctx.fillRect(padding, padding, canvas.width / dpr - padding * 2, timelineHeight)

    // Desenhar linhas de grade da timeline
    ctx.strokeStyle = '#e0e0e0'
    ctx.lineWidth = 1
    const gridLines = 10
    for (let i = 0; i <= gridLines; i++) {
      const x = padding + (i / gridLines) * (canvas.width / dpr - padding * 2)
      ctx.beginPath()
      ctx.moveTo(x, padding)
      ctx.lineTo(x, padding + timelineHeight)
      ctx.stroke()
    }

    // Desenhar labels da timeline
    ctx.fillStyle = '#666'
    ctx.font = '12px Arial'
    ctx.textAlign = 'center'
    for (let i = 0; i <= gridLines; i++) {
      const x = padding + (i / gridLines) * (canvas.width / dpr - padding * 2)
      const date = xToDate(x)
      const label = date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
      ctx.fillText(label, x, padding + timelineHeight - 5)
    }

    // Desenhar linha do tempo atual
    const now = new Date()
    if (now >= adjustedMinDate && now <= adjustedMaxDate) {
      const nowX = dateToX(now)
      ctx.strokeStyle = '#f44336'
      ctx.lineWidth = 2
      ctx.setLineDash([5, 5])
      ctx.beginPath()
      ctx.moveTo(nowX, padding + timelineHeight)
      ctx.lineTo(nowX, height - padding)
      ctx.stroke()
      ctx.setLineDash([])
    }

    // Desenhar barras das tasks
    const projectTasks = tasks.filter(task => task.type === 'project')
    const taskTasks = tasks.filter(task => task.type === 'task')

    let yOffset = padding + timelineHeight + 20

    projectTasks.forEach((task, index) => {
      const startX = dateToX(task.start_date)
      const endX = dateToX(task.end_date)
      const barWidth = endX - startX

      // Desenhar barra do projeto
      ctx.fillStyle = task.color || '#4caf50'
      ctx.fillRect(startX, yOffset, barWidth, barHeight)

      // Desenhar borda
      ctx.strokeStyle = '#333'
      ctx.lineWidth = 1
      ctx.strokeRect(startX, yOffset, barWidth, barHeight)

      // Desenhar progresso
      if (task.progress > 0) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
        const progressWidth = (barWidth * task.progress) / 100
        ctx.fillRect(startX, yOffset, progressWidth, barHeight)
      }

      // Desenhar texto
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 12px Arial'
      ctx.textAlign = 'center'
      const text = task.text.length > 20 ? task.text.substring(0, 20) + '...' : task.text
      ctx.fillText(text, startX + barWidth / 2, yOffset + barHeight / 2 + 4)

      // Desenhar tasks dos profissionais
      const childTasks = taskTasks.filter(t => t.parent === task.id)
      childTasks.forEach((childTask, childIndex) => {
        const childY = yOffset + barHeight + 10 + (childIndex * (barHeight + 5))
        const childStartX = dateToX(childTask.start_date)
        const childEndX = dateToX(childTask.end_date)
        const childBarWidth = childEndX - childStartX

        // Desenhar barra do profissional
        ctx.fillStyle = childTask.color || '#2196f3'
        ctx.fillRect(childStartX, childY, childBarWidth, barHeight - 10)

        // Desenhar borda
        ctx.strokeStyle = '#333'
        ctx.lineWidth = 1
        ctx.strokeRect(childStartX, childY, childBarWidth, barHeight - 10)

        // Desenhar progresso
        if (childTask.progress > 0) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
          const progressWidth = (childBarWidth * childTask.progress) / 100
          ctx.fillRect(childStartX, childY, progressWidth, barHeight - 10)
        }

        // Desenhar texto do profissional
        ctx.fillStyle = '#333'
        ctx.font = '10px Arial'
        ctx.textAlign = 'center'
        const childText = childTask.text.length > 15 ? childTask.text.substring(0, 15) + '...' : childTask.text
        ctx.fillText(childText, childStartX + childBarWidth / 2, childY + (barHeight - 10) / 2 + 3)
      })

      yOffset += barHeight + 20 + (childTasks.length * (barHeight + 5))
    })

  }, [tasks, height])

  if (!tasks.length) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Alert severity="info">
          Nenhum dado disponível para exibir no gráfico Gantt.
        </Alert>
      </Paper>
    )
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Visualização Gantt
      </Typography>
      <Box sx={{ overflowX: 'auto' }}>
        <canvas
          ref={canvasRef}
          style={{
            border: '1px solid #e0e0e0',
            borderRadius: '4px',
            width: '100%',
            minWidth: '800px'
          }}
        />
      </Box>
    </Paper>
  )
}

export default GanttChart 