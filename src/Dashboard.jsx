import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import axios from 'axios';
import { FaCheckCircle, FaTimesCircle, FaMinusCircle } from 'react-icons/fa';
import { GiHamburgerMenu } from 'react-icons/gi';

import { AgGridReact } from "ag-grid-react"; // React Data Grid Component
import "ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the Data Grid
import "ag-grid-community/styles/ag-theme-quartz.css"; // Optional Theme applied to the Data Grid
import "./assets/App.css";
import statusRenderer from './helper/statusRenderer';

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
    gap: 20px;
    width: 100%;
    height: calc(100vh - 70px);
`;

const Title = styled.h3`
    color: #333;
    margin-bottom: 20px;
`;

const TableContainer = styled.div`
    width: 100%;
    overflow: auto;
    background-color: #fff;
    padding: 0 20px 20px 20px;
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
`;

const AgentsContainer = styled.div`
    display: grid;
    background-color: #fff;
    padding: 0 20px 20px 20px;
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    overflow: auto;
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
    width: 80%
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
    const [agents, setAgents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const gridRef = useRef(null);

    // Workgroup Dashboard
    const [rowDataWorkgroup, setRowDataWorkgroup] = useState([]);
    const defaultColDefWorkgroup = useMemo(() => {
        return {
            flex: 1,
            filter: true,
        };
    });
    const [colDefsWorkgroup, setColDefsWorkgroup] = useState([
        { field: "last_name", headerName: "LAST NAME" },
        { field: "first_name", headerName: "FIRST NAME" },
        { field: "extension", headerName: "EXTENSION" },
        { field: "title", headerName: "TITLE" },
        { field: "status", headerName: "STATUS", cellRenderer: statusRenderer, enableCellChangeFlash: true},
        { field: "logged_on", headerName: "LOGGED ON", enableCellChangeFlash: true },
        { field: "time_in_status", headerName: "TIME IN STATUS", enableCellChangeFlash: true, cellRenderer: "agAnimateShowChangeCellRenderer" },
        { field: "additional_field", headerName: "ADDITIONAL FIELD" },
        { field: "resource_number", headerName: "RESOURCE NUMBER" },
    ]);
    const gridOptionsWorkgroup = {
        getRowId: (params) => params.data.id.toString(),
    };

    //Agent Status Dashboard
    const [rowDataAgents, setRowDataAgents] = useState([]);
    const defaultColDefAgents = useMemo(() => {
        return {
            flex: 1,
            filter: true,
        };
    });
    const [colDefsAgents, setColDefsAgents] = useState([
        { field: "workgroup", headerName: "WORKGROUP" },
        { field: "longest_time_waiting", headerName: "LONGEST TIME WAITING" },
        { field: "agents_available", headerName: "AGENTS AVAILABLE" },
        { field: "interactions_waiting", headerName: "INTERACTIONS WAITING" },
        { field: "current_shift_service_level_target", headerName: "CURRENT SHIFT SERVICE LEVEL TARGET"},
        { field: "current_shift_interactions", headerName: "CURRENT SHIFT INTERACTIONS" },
        { field: "department", headerName: "DEPARTMENT" },
    ]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get('http://ec2-3-138-200-194.us-east-2.compute.amazonaws.com:8000/api/items/');
                const updatedUsers = response.data;
                setRowDataWorkgroup(updatedUsers);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        const fetchAgents = async () => {
            try {
                const response = await axios.get('http://ec2-3-138-200-194.us-east-2.compute.amazonaws.com:8000/api/statistics/');
                setAgents(response.data);
                setRowDataAgents(response.data);
            } catch (error) {
                console.error('Error fetching agents:', error);
            }
        };

        fetchUsers();
        fetchAgents();

        const interval = setInterval(() => {
            fetchUsersInAnInterval();
            fetchAgents();
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchUsersInAnInterval = async () => {
        try {
            const response = await axios.get('http://ec2-3-138-200-194.us-east-2.compute.amazonaws.com:8000/api/items/');
            const updatedUsers = response.data;

            // Update the grid with new data
            const gridApi = gridRef.current.api;
            gridApi.applyTransactionAsync({ update: updatedUsers });
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    }

    const onGridReady = useCallback((params) => {
        axios.get("http://ec2-3-138-200-194.us-east-2.compute.amazonaws.com:8000/api/items/")
            .then((response) => setRowDataWorkgroup(response.data));
    }, []);

    const onFilterTextBoxChanged = useCallback(() => {
        gridRef.current.api.setGridOption(
            "quickFilterText",
            document.getElementById("filter-text-box").value,
        );
    }, []);


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
                            id="filter-text-box"
                            placeholder="Search Dashboard"
                            onInput={onFilterTextBoxChanged}
                        />
                    </SearchContainer>
                    <div className="ag-theme-quartz" style={{ height: 500 }}>
                        <AgGridReact
                            rowData={rowDataWorkgroup}
                            columnDefs={colDefsWorkgroup}
                            pagination={true}
                            paginationPageSize={10}
                            paginationPageSizeSelector={[10,20,50,100]}
                            defaultColDef={defaultColDefWorkgroup}
                            gridOptions={gridOptionsWorkgroup}
                            ref={gridRef}
                            onGridReady={onGridReady}
                        />
                    </div>
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
                    <div className="ag-theme-quartz" style={{ height: 500 }}>
                        <AgGridReact
                            rowData={rowDataAgents}
                            columnDefs={colDefsAgents}
                            pagination={true}
                            paginationPageSize={10}
                            paginationPageSizeSelector={[10,20,50,100]}
                            defaultColDef={defaultColDefAgents}
                        />
                    </div>
                </AgentsContainer>
            </DashboardContainer>
        </>
    );
};

export default Dashboard;