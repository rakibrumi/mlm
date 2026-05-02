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
    TextField,
    InputAdornment,
    TablePagination,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Stack,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
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
    
    // Search and Pagination states
    const [searchTerm, setSearchTerm] = useState('')
    const [filterType, setFilterType] = useState('all')
    const [page, setPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(25)

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

    const handleChangePage = (event, newPage) => {
        setPage(newPage)
    }

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10))
        setPage(0)
    }

    const getTypeColor = (type) => {
        return type === 'credit' ? 'success' : 'error'
    }

    const formatCurrency = (amount) => {
        return `৳ ${Number(amount).toFixed(2)}`
    }

    // Filtering logic
    const filteredTransactions = transactions.filter((item) => {
        const matchesSearch = 
            (item.description?.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (item.userReference?.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (item.relatedUser?.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (item.category?.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (item.id?.toLowerCase().includes(searchTerm.toLowerCase()))
        
        const matchesType = filterType === 'all' || item.type === filterType
        
        return matchesSearch && matchesType
    })

    const paginatedTransactions = filteredTransactions.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    )

    if (!isAdmin) {
        return null
    }

    return (
        <MainLayout>
            <RootStyle title="Old Transactions | Good Health">
                <Container maxWidth="lg">
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h4" gutterBottom>
                            Old Transaction Records (Archived)
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            This data is loaded directly from the <strong>public/transactions.json</strong> file.
                        </Typography>
                    </Box>

                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <TextField
                                fullWidth
                                label="Search transactions..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value)
                                    setPage(0)
                                }}
                                placeholder="Search by User, Description, Category..."
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                            <FormControl sx={{ minWidth: 150 }}>
                                <InputLabel>Type</InputLabel>
                                <Select
                                    value={filterType}
                                    label="Type"
                                    onChange={(e) => {
                                        setFilterType(e.target.value)
                                        setPage(0)
                                    }}
                                >
                                    <MenuItem value="all">All Types</MenuItem>
                                    <MenuItem value="credit">Credit</MenuItem>
                                    <MenuItem value="debit">Debit</MenuItem>
                                </Select>
                            </FormControl>
                        </Stack>
                    </Paper>

                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', my: 10 }}>
                            <CircularProgress size={60} />
                        </Box>
                    ) : (
                        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                            <TableContainer sx={{ maxHeight: 600 }}>
                                <Table stickyHeader aria-label="sticky table">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }} align="right">Amount</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }}>User</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Related</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {paginatedTransactions.length > 0 ? (
                                            paginatedTransactions.map((row) => (
                                                <TableRow key={row.id} hover>
                                                    <TableCell sx={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                                                        {row.date ? new Date(row.date).toLocaleString() : 'N/A'}
                                                    </TableCell>
                                                    <TableCell sx={{ maxWidth: 250 }}>{row.description}</TableCell>
                                                    <TableCell sx={{ textTransform: 'capitalize' }}>
                                                        {row.category?.replace('_', ' ')}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={row.type?.toUpperCase()}
                                                            color={getTypeColor(row.type)}
                                                            size="small"
                                                            variant="soft"
                                                            sx={{ fontWeight: 'bold' }}
                                                        />
                                                    </TableCell>
                                                    <TableCell align="right" sx={{
                                                        color: row.type === 'credit' ? 'success.main' : 'error.main',
                                                        fontWeight: 'bold'
                                                    }}>
                                                        {row.type === 'credit' ? '+' : '-'}{formatCurrency(row.amount)}
                                                    </TableCell>
                                                    <TableCell sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>{row.userReference}</TableCell>
                                                    <TableCell sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>{row.relatedUser}</TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                                                    <Typography variant="subtitle1" color="text.secondary">
                                                        No transactions matched your search criteria.
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <TablePagination
                                rowsPerPageOptions={[10, 25, 50, 100]}
                                component="div"
                                count={filteredTransactions.length}
                                rowsPerPage={rowsPerPage}
                                page={page}
                                onPageChange={handleChangePage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                            />
                        </Paper>
                    )}
                </Container>
            </RootStyle>
        </MainLayout>
    )
}

export default OldTransactions
