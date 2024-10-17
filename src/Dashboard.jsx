import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import axios from 'axios';
import { FiFilter } from 'react-icons/fi';
import { FaCheckCircle, FaTimesCircle, FaMinusCircle } from 'react-icons/fa';
import { GiHamburgerMenu } from 'react-icons/gi';

const AppBar = styled.div`
    background-color: #ffffff;
    display: flex;
    align-items: center;
    padding: 10px 20px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
`;

const Logo = styled.img`
    height: 40px;
    margin-right: 20px;
`;

const AppTitle = styled.h2`
    color: #333;
    margin: 0;
    flex-grow: 1;
`;

const HamburgerIcon = styled(GiHamburgerMenu)`
    font-size: 24px;
    cursor: pointer;
`;

const DashboardContainer = styled.div`
    padding: 20px;
    display: grid;
    grid-template-rows: auto 1fr;
    grid-template-columns: 2fr 1fr;
    gap: 20px;
    width: 100%;
    height: calc(100vh - 70px);
`;

const Title = styled.h1`
    color: #333;
    margin-bottom: 20px;
`;

const TableContainer = styled.div`
    width: 100%;
    height: 100%;
    overflow: auto;
    background-color: #fff;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    grid-row: 1;
    grid-column: 1;
`;

const AgentsContainer = styled.div`
    background-color: #fff;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    height: 100%;
    overflow: auto;
    grid-row: 1;
    grid-column: 2;
`;

const SearchContainer = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
`;

const SearchInput = styled.input`
    padding: 10px;
    font-size: 16px;
    border: 1px solid #ccc;
    border-radius: 4px;
    width: 300px;
`;

const FilterButton = styled.button`
    background: none;
    border: none;
    cursor: pointer;
    font-size: 24px;
    color: #555;
`;

const Table = styled.table`
    width: 100%;
    border-collapse: collapse;
    background-color: #fff;
`;

const TableHeader = styled.th`
    border: 1px solid #ddd;
    padding: 12px;
    background-color: #f2f2f2;
    text-align: left;
`;

const TableRow = styled.tr`
    &:nth-child(even) {
        background-color: #f9f9f9;
    }
`;

const TableCell = styled.td`
    border: 1px solid #ddd;
    padding: 12px;
    animation: ${props => props.isHighlighted ? `${highlightAnimationBlue} 1s ease` : 'none'};
`;

const highlightAnimationYellow = keyframes`
    0% { background-color: #ffff99; }
    100% { background-color: transparent; }
`;

const highlightAnimationBlue = keyframes`
    0% { background-color: #add8e6; }
    100% { background-color: transparent; }
`;

const HighlightedRow = styled(TableRow)`
    animation: ${highlightAnimationYellow} 1s ease;
`;

const StatusBar = styled.div`
    margin-bottom: 20px;
`;

const StatusOverview = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    position: relative;
    width: 100%;
    height: 10px;
    background-color: #e0e0e0;
    border-radius: 5px;
`;

const StatusDot = styled.div`
    height: 10px;
    border-radius: 5px;
    position: absolute;
    left: ${props => props.left}%;
    width: ${props => props.width}%;
    background-color: ${props => props.color};
`;

const StatusIcons = styled.div`
    display: flex;
    gap: 15px;
    margin-top: 10px;
    justify-content: space-between;
`;

const StatusIconWrapper = styled.div`
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 18px;
    font-weight: bold;
`;

const Dashboard = () => {
    const [users, setUsers] = useState([]);
    const [agents, setAgents] = useState([]);
    const [updatedUserIds, setUpdatedUserIds] = useState([]);
    const [changedCells, setChangedCells] = useState({});
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get('http://localhost:3001/api/items/');
                const updatedUsers = response.data;
                const updatedIds = updatedUsers.map(user => user.id);

                setUsers(prevUsers => {
                    const prevUserMap = new Map(prevUsers.map(user => [user.id, user]));
                    const newUserMap = new Map(updatedUsers.map(user => [user.id, user]));

                    const changes = [];
                    const updatedCells = {};
                    newUserMap.forEach((newUser, id) => {
                        if (!prevUserMap.has(id) || JSON.stringify(prevUserMap.get(id)) !== JSON.stringify(newUser)) {
                            changes.push(id);
                            const prevUser = prevUserMap.get(id);
                            if (prevUser) {
                                Object.keys(newUser).forEach(key => {
                                    if (newUser[key] !== prevUser[key]) {
                                        if (!updatedCells[id]) {
                                            updatedCells[id] = [];
                                        }
                                        updatedCells[id].push(key);
                                    }
                                });
                            }
                        }
                    });

                    setUpdatedUserIds(changes);
                    setChangedCells(updatedCells);
                    return updatedUsers;
                });
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        const fetchAgents = async () => {
            try {
                const response = await axios.get('http://localhost:3001/api/statistics/');
                setAgents(response.data);
            } catch (error) {
                console.error('Error fetching agents:', error);
            }
        };

        fetchUsers();
        fetchAgents();
        const interval = setInterval(() => {
            fetchUsers();
            fetchAgents();
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const filteredUsers = users.filter(user =>
        user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.department.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredAgents = agents.filter(agent =>
        agent.workgroup.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const availableAgents = filteredAgents.reduce((acc, agent) => acc + (agent.agents_available || 0), 0);
    const unavailableAgents = filteredAgents.filter(agent => agent.status === 'unavailable').length;
    const offlineAgents = filteredAgents.filter(agent => agent.status === 'offline').length;
    const totalAgents = availableAgents + unavailableAgents + offlineAgents;

    const availablePercentage = (availableAgents / totalAgents) * 100;
    const unavailablePercentage = (unavailableAgents / totalAgents) * 100;
    const offlinePercentage = (offlineAgents / totalAgents) * 100;

    return (
        <>
            <AppBar>
                <Logo src="/hf-logo.svg" alt="Logo" />
                <AppTitle>RTA DASHBOARD</AppTitle>
                <HamburgerIcon />
            </AppBar>
            <DashboardContainer>
                <TableContainer>
                    <Title>Workgroup Dashboard</Title>
                    <SearchContainer>
                        <SearchInput
                            type="text"
                            placeholder="Search workgroups..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <FilterButton onClick={() => alert('Filter options will be implemented soon!')}>
                            <FiFilter />
                        </FilterButton>
                    </SearchContainer>
                    <Table>
                        <thead>
                        <tr>
                            <TableHeader>Last Name</TableHeader>
                            <TableHeader>First Name</TableHeader>
                            <TableHeader>Extension</TableHeader>
                            <TableHeader>Department</TableHeader>
                            <TableHeader>Title</TableHeader>
                            <TableHeader>Status</TableHeader>
                            <TableHeader>Logged On</TableHeader>
                            <TableHeader>Time in Status</TableHeader>
                            <TableHeader>Activated</TableHeader>
                            <TableHeader>Additional Field</TableHeader>
                            <TableHeader>Resource Number</TableHeader>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredUsers.map(user => {
                            const isHighlighted = updatedUserIds.includes(user.id);
                            const RowComponent = isHighlighted ? HighlightedRow : TableRow;
                            return (
                                <RowComponent key={user.id}>
                                    {Object.keys(user).map(key => (
                                        <TableCell key={key} isHighlighted={changedCells[user.id]?.includes(key)}>{user[key]}</TableCell>
                                    ))}
                                </RowComponent>
                            );
                        })}
                        </tbody>
                    </Table>
                </TableContainer>
                <AgentsContainer>
                    <Title>Agents Status</Title>
                    <StatusBar>
                        <StatusOverview>
                            <StatusDot color="green" width={availablePercentage} left={0} />
                            <StatusDot color="red" width={unavailablePercentage} left={availablePercentage} />
                            <StatusDot color="gray" width={offlinePercentage} left={availablePercentage + unavailablePercentage} />
                        </StatusOverview>
                        <StatusIcons>
                            <StatusIconWrapper>
                                <FaCheckCircle color="green" />
                                <span>Available: {availableAgents}</span>
                            </StatusIconWrapper>
                            <StatusIconWrapper>
                                <FaTimesCircle color="red" />
                                <span>Unavailable: {unavailableAgents}</span>
                            </StatusIconWrapper>
                            <StatusIconWrapper>
                                <FaMinusCircle color="gray" />
                                <span>Offline: {offlineAgents}</span>
                            </StatusIconWrapper>
                        </StatusIcons>
                    </StatusBar>
                    <Table>
                        <thead>
                        <tr>
                            <TableHeader>Workgroup</TableHeader>
                            <TableHeader>Longest Interaction Waiting</TableHeader>
                            <TableHeader>Agents Available</TableHeader>
                            <TableHeader>Interactions Waiting</TableHeader>
                            <TableHeader>Service Level Target</TableHeader>
                            <TableHeader>Interactions Abandoned</TableHeader>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredAgents.map((agent, index) => (
                            <TableRow key={index}>
                                <TableCell>{agent.workgroup}</TableCell>
                                <TableCell>{agent.longest_time_waiting || 'N/A'}</TableCell>
                                <TableCell>{agent.agents_available}</TableCell>
                                <TableCell>{agent.interactions_waiting}</TableCell>
                                <TableCell>{agent.current_shift_service_level_target || 'N/A'} %</TableCell>
                                <TableCell>{agent.interactions_abandoned || 0}</TableCell>
                            </TableRow>
                        ))}
                        </tbody>
                    </Table>
                </AgentsContainer>
            </DashboardContainer>
        </>
    );
};

export default Dashboard;
