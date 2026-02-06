import React, { useEffect, useState } from 'react'
import { styled } from '@mui/material/styles'
import MainLayout from '@/layouts/main'
import Page from '@/components/Page'
import {
    Box,
    Container,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TextField,
    Button,
    Chip,
    ButtonGroup,
} from '@mui/material'
import { useRouter } from 'next/router'
import { getTransactions, getUserByReference } from '@/func/functions'
import { formatDate } from '@/helper/helper'

const RootStyle = styled(Page)({
    minHeight: '100%',
    paddingTop: 100,
    paddingBottom: 100,
})

const History = () => {
    const router = useRouter()
    const [transactions, setTransactions] = useState([])
    const [currentUser, setCurrentUser] = useState(null)
    const [searchRef, setSearchRef] = useState('')
    const [viewingUser, setViewingUser] = useState(null)
    const [filterType, setFilterType] = useState('all') // 'all', 'credit', 'debit'

    useEffect(() => {
        const checkAuth = async () => {
            const userStr =
                typeof window !== 'undefined'
                    ? window.localStorage.getItem('earth_user')
                    : null

            if (!userStr) {
                router.push('/auth/login')
                return
            }

            const parsedUser = JSON.parse(userStr)
            const userData = await getUserByReference(parsedUser.myReference)

            if (!userData) {
                router.push('/auth/login')
                return
            }

            setCurrentUser(userData)
            setViewingUser(userData)
            fetchTransactions(userData.myReference)
        }

        checkAuth()
    }, [])

    const fetchTransactions = async (refId) => {
        const data = await getTransactions(refId)
        setTransactions(data)
    }

    const handleSearch = async () => {
        if (!searchRef) return
        // Allow search by reference ID directly
        const targetUser = await getUserByReference(searchRef)
        if (targetUser) {
            setViewingUser(targetUser)
            fetchTransactions(targetUser.myReference)
        } else {
            alert('User not found')
        }
    }

    const getTypeColor = (type) => {
        return type === 'credit' ? 'success' : 'error'
    }

    const formatCurrency = (amount) => {
        return `৳ ${Number(amount).toFixed(2)}`
    }

    return (
        <MainLayout>
            <RootStyle title="History | Good Health">
                <Container>
                    <Typography variant="h4" gutterBottom>
                        Transaction History
                    </Typography>

                    {currentUser?.role === 'admin' && (
                        <Box sx={{ mb: 4, display: 'flex', gap: 2, alignItems: 'center', p: 2, bgcolor: 'background.paper', borderRadius: 1, boxShadow: 1 }}>
                            <TextField
                                label="Search User by Reference ID"
                                variant="outlined"
                                size="small"
                                value={searchRef}
                                onChange={(e) => setSearchRef(e.target.value)}
                                sx={{ minWidth: 250 }}
                            />
                            <Button variant="contained" onClick={handleSearch}>
                                Search
                            </Button>
                            {viewingUser && viewingUser.myReference !== currentUser.myReference && (
                                <Button variant="outlined" onClick={() => {
                                    setViewingUser(currentUser)
                                    setSearchRef('')
                                    fetchTransactions(currentUser.myReference)
                                }}>
                                    Reset to My History
                                </Button>
                            )}
                        </Box>
                    )}

                    {viewingUser && (
                        <Typography variant="subtitle1" sx={{ mb: 2, color: 'text.secondary' }}>
                            Showing history for: <strong>{viewingUser.name} ({viewingUser.myReference})</strong>
                        </Typography>
                    )}

                    <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
                        <ButtonGroup variant="outlined" aria-label="outlined button group">
                            <Button
                                onClick={() => setFilterType('all')}
                                variant={filterType === 'all' ? 'contained' : 'outlined'}
                            >
                                All
                            </Button>
                            <Button
                                onClick={() => setFilterType('credit')}
                                variant={filterType === 'credit' ? 'contained' : 'outlined'}
                                color="success"
                            >
                                Credit
                            </Button>
                            <Button
                                onClick={() => setFilterType('debit')}
                                variant={filterType === 'debit' ? 'contained' : 'outlined'}
                                color="error"
                            >
                                Debit
                            </Button>
                        </ButtonGroup>
                    </Box>

                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Date</TableCell>
                                    <TableCell>Description</TableCell>
                                    <TableCell>Category</TableCell>
                                    <TableCell>Type</TableCell>
                                    <TableCell align="right">Amount</TableCell>
                                    <TableCell>Related User</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {transactions.length > 0 ? (
                                    transactions
                                        .filter(t => filterType === 'all' ? true : t.type === filterType)
                                        .map((row) => (
                                            <TableRow key={row.id}>
                                                <TableCell>{new Date(row.date).toLocaleDateString()} {new Date(row.date).toLocaleTimeString()}</TableCell>
                                                <TableCell>{row.description}</TableCell>
                                                <TableCell sx={{ textTransform: 'capitalize' }}>
                                                    {row.category?.replace('_', ' ')}
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={row.type?.toUpperCase()}
                                                        color={getTypeColor(row.type)}
                                                        size="small"
                                                    />
                                                </TableCell>
                                                <TableCell align="right" sx={{
                                                    color: row.type === 'credit' ? 'green' : 'red',
                                                    fontWeight: 'bold'
                                                }}>
                                                    {row.type === 'credit' ? '+' : '-'}{formatCurrency(row.amount)}
                                                </TableCell>
                                                <TableCell>{row.relatedUser}</TableCell>
                                            </TableRow>
                                        ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center">
                                            No transactions found
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Container>
            </RootStyle>
        </MainLayout>
    )
}

export default History
