import React, { useState } from 'react'
import { Card, Typography, Form, Input, Button, Alert } from 'antd'
import { useAuth } from '../contexts/AuthContext'
import logoAzul from '../assets/logo_azul.png'

const Login = () => {
  const { login } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFinish = async (values: { email: string; senha: string }) => {
    setLoading(true)
    setError(null)

    try {
      await login(values.email, values.senha)
    } catch (err) {
      console.error('Erro ao fazer login:', err)
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Erro de conexão. Verifique se o servidor está rodando.')
      }
    } finally {
      setLoading(false)
    }
  }

  const { Title, Text } = Typography

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0031BC',
      padding: 16
    }}>
      <Card style={{ width: '100%', maxWidth: 420, borderRadius: 12 }} bodyStyle={{ padding: 24 }}>
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
            <img src={logoAzul} alt="FTD" style={{ height: 56, width: 'auto' }} />
          </div>
          <Title level={3} style={{ marginBottom: 4 }}>Login</Title>
          <Text type="secondary">Acesse sua conta para continuar</Text>
        </div>

        {error && (
          <Alert type="error" message={error} showIcon style={{ marginBottom: 12 }} />
        )}

        <Form layout="vertical" onFinish={handleFinish}>
          <Form.Item label="Email" name="email" rules={[{ required: true, message: 'Informe o email' }]} style={{ marginBottom: 12 }}>
            <Input
              type="email"
              size="large"
              autoComplete="email"
              autoFocus
              disabled={loading}
              placeholder="seuemail@empresa.com"
            />
          </Form.Item>
          <Form.Item label="Senha" name="senha" rules={[{ required: true, message: 'Informe a senha' }]} style={{ marginBottom: 4 }}>
            <Input.Password
              size="large"
              autoComplete="current-password"
              disabled={loading}
              placeholder="••••••••"
            />
          </Form.Item>
          <Button
            htmlType="submit"
            type="primary"
            size="large"
            block
            loading={loading}
            style={{ marginTop: 8, background: '#0031BC' }}
          >
            Entrar
          </Button>
        </Form>

        
      </Card>
    </div>
  )
}

export default Login
