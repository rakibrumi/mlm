import React, { useEffect, useState } from 'react'
import {
  Container,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  TextField,
  Divider,
} from '@mui/material'
import MainLayout from '@/layouts/main'
import Page from '@/components/Page'
import { getMonthlyBonusCandidates, payMonthlyBonus, getUserByReference, getMonthlyBonusHistory } from '@/func/functions'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'
import { formatDate } from '@/helper/helper'

export default function MonthlyBonusAdmin() {
  const [candidates, setCandidates] = useState([])
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [month, setMonth] = useState('')
  const [role, setRole] = useState(null)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const verifyAdmin = async () => {
      setCheckingAuth(true)
      try {
        const storedUser = JSON.parse(localStorage.getItem('earth_user') || '{}')
        if (storedUser.myReference) {
          const userData = await getUserByReference(storedUser.myReference)
          if (userData) {
            setRole(userData.role)
          }
        }
      } catch (error) {
        console.error('Auth verification failed', error)
      } finally {
        setCheckingAuth(false)
      }
    }

    verifyAdmin()

    // Set default month to last month
    const date = new Date()
    date.setMonth(date.getMonth() - 1)
    const lastMonthStr = date.toISOString().slice(0, 7) // "YYYY-MM"
    setMonth(lastMonthStr)
  }, [])

  const fetchCandidates = async () => {
    if (!month || role !== 'admin') return
    setLoading(true)
    try {
      const data = await getMonthlyBonusCandidates(month)
      setCandidates(data)
    } catch (error) {
      toast.error('Failed to fetch candidates')
    } finally {
      setLoading(false)
    }
  }

  const fetchHistory = async () => {
    if (role !== 'admin') return
    setLoadingHistory(true)
    try {
      const data = await getMonthlyBonusHistory()
      setHistory(data)
    } catch (error) {
      toast.error('Failed to fetch history')
    } finally {
      setLoadingHistory(false)
    }
  }

  useEffect(() => {
    if (month && role === 'admin') {
      fetchCandidates()
      fetchHistory()
    }
  }, [month, role])

  const handlePay = async (userId) => {
    if (!window.confirm('Are you sure you want to pay 5000 bonus to this user?')) return

    try {
      const res = await payMonthlyBonus(userId, month)
      if (res.success) {
        toast.success('Bonus paid successfully')
        fetchCandidates() // Refresh list
        fetchHistory() // Refresh history
      } else {
        toast.error(res.error || 'Failed to pay bonus')
      }
    } catch (error) {
      toast.error('An error occurred')
    }
  }

  if (checkingAuth) {
    return (
      <MainLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 20 }}>
          <CircularProgress />
        </Box>
      </MainLayout>
    )
  }

  if (role !== 'admin') {
    return (
      <MainLayout>
        <Container sx={{ mt: 10 }}>
          <Alert severity="error">Access Denied. Admin only. (Your role: {role || 'Unknown'})</Alert>
          <Button sx={{ mt: 2 }} onClick={() => router.push('/my-account')}>Go to My Account</Button>
        </Container>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <Page title="Admin | Monthly Bonus" sx={{ mt: 10 }}>
        <Container maxWidth="lg">
          <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h4">Monthly Performance Bonus</Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <TextField
                type="month"
                label="Select Month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                size="small"
                InputLabelProps={{ shrink: true }}
              />
              <Button variant="outlined" onClick={fetchCandidates}>Refresh</Button>
            </Box>
          </Box>

          <Typography variant="h6" sx={{ mb: 2 }}>Eligible Candidates for {month}</Typography>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
              <CircularProgress />
            </Box>
          ) : candidates.length === 0 ? (
            <Alert severity="info" sx={{ mb: 4 }}>No eligible candidates found for {month}.</Alert>
          ) : (
            <TableContainer component={Paper} sx={{ mb: 6 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>User ID</TableCell>
                    <TableCell align="center">Left New</TableCell>
                    <TableCell align="center">Right New</TableCell>
                    <TableCell align="center">Status</TableCell>
                    <TableCell align="right">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {candidates.map((c) => (
                    <TableRow key={c.userId}>
                      <TableCell>{c.name}</TableCell>
                      <TableCell>{c.userId}</TableCell>
                      <TableCell align="center">{c.leftNew}</TableCell>
                      <TableCell align="center">{c.rightNew}</TableCell>
                      <TableCell align="center">
                        {c.alreadyPaid ? (
                          <Typography sx={{ color: 'success.main', fontWeight: 'bold' }}>Paid</Typography>
                        ) : (
                          <Typography sx={{ color: 'warning.main' }}>Pending</Typography>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          disabled={c.alreadyPaid}
                          onClick={() => handlePay(c.userId)}
                        >
                          {c.alreadyPaid ? 'Already Paid' : 'Pay 5000'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          <Divider sx={{ my: 4 }} />

          <Typography variant="h6" sx={{ mb: 2 }}>Payment History (All Time)</Typography>
          {loadingHistory ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
              <CircularProgress />
            </Box>
          ) : history.length === 0 ? (
            <Alert severity="info">No bonus payments recorded yet.</Alert>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date Paid</TableCell>
                    <TableCell>User ID</TableCell>
                    <TableCell>Bonus Month</TableCell>
                    <TableCell align="right">Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {history.map((h) => (
                    <TableRow key={h.id}>
                      <TableCell>{new Date(h.date).toLocaleString()}</TableCell>
                      <TableCell>{h.userId}</TableCell>
                      <TableCell>{h.month}</TableCell>
                      <TableCell align="right">৳ {h.amount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Container>
      </Page>
    </MainLayout>
  )
}
