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
    Chip,
    CircularProgress,
} from '@mui/material'
import { useRouter } from 'next/router'
import { getUserByReference } from '@/func/functions'

const RootStyle = styled(Page)({
    minHeight: '100%',
    paddingTop: 100,
    paddingBottom: 100,
})

const OldTransactions = () => {
    const router = useRouter()
    const [transactions, setTransactions] = useState([])
    const [loading, setLoading] = useState(true)
    const [isAdmin, setIsAdmin] = useState(false)

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

            if (!userData || userData.role !== 'admin') {
                router.push('/my-account')
                return
            }

            setIsAdmin(true)
            fetchData()
        }

        checkAuth()
    }, [router])

    const fetchData = async () => {
        setLoading(true)
        try {
            const response = await fetch('/transactions.json')
            const data = await response.json()
            // Sort in memory by date descending
            const sortedData = data.sort((a, b) => new Date(b.date) - new Date(a.date))
            setTransactions(sortedData)
        } catch (error) {
            console.error('Error fetching JSON data:', error)
        }
        setLoading(false)
    }

    const getTypeColor = (type) => {
        return type === 'credit' ? 'success' : 'error'
    }

    const formatCurrency = (amount) => {
        return `৳ ${Number(amount).toFixed(2)}`
    }

    if (!isAdmin) {
        return null
    }

    return (
        <MainLayout>
            <RootStyle title="Old Transactions | Good Health">
                <Container>
                    <Typography variant="h4" gutterBottom>
                        Old Transaction Records (Archived)
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 4, color: 'text.secondary' }}>
                        This data is loaded directly from the <strong>public/transactions.json</strong> file.
                    </Typography>

                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Date</TableCell>
                                        <TableCell>Description</TableCell>
                                        <TableCell>Category</TableCell>
                                        <TableCell>Type</TableCell>
                                        <TableCell align="right">Amount</TableCell>
                                        <TableCell>User</TableCell>
                                        <TableCell>Related</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {transactions.length > 0 ? (
                                        transactions.map((row) => (
                                            <TableRow key={row.id}>
                                                <TableCell sx={{ fontSize: '0.8rem' }}>
                                                    {row.date ? new Date(row.date).toLocaleString() : 'N/A'}
                                                </TableCell>
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
                                                <TableCell sx={{ fontSize: '0.8rem' }}>{row.userReference}</TableCell>
                                                <TableCell sx={{ fontSize: '0.8rem' }}>{row.relatedUser}</TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={7} align="center">
                                                No old transactions found
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Container>
            </RootStyle>
        </MainLayout>
    )
}

export default OldTransactions
