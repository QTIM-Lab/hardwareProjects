import React, { useState } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import IconButton from "@mui/material/IconButton";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import Collapse from "@mui/material/Collapse";

const ExpandableTable = ({ columns, data, renderRowDetail }) => {
  const [openRows, setOpenRows] = useState({});

  const toggleRow = (id) => {
    setOpenRows((prevOpenRows) => ({
      ...prevOpenRows,
      [id]: !prevOpenRows[id],
    }));
  };

  return (
    <Table
      aria-label="expandable table"
      sx={{
        // Add a border to the table
        border: 1,
        borderColor: "divider",

        // Add margin around the table
        margin: (theme) => theme.spacing(2),

        // Additional styling can go here
      }}
    >
      <TableBody>
        {data.map((item) => (
          <React.Fragment key={item.id}>
            <TableRow>
              <TableCell sx={{ width: "1em" }}>
                {" "}
                {/* Adjust the width as needed */}
                <IconButton size="small" onClick={() => toggleRow(item.id)}>
                  {openRows[item.id] ? (
                    <KeyboardArrowUpIcon />
                  ) : (
                    <KeyboardArrowDownIcon />
                  )}
                </IconButton>
              </TableCell>
              {columns.map((column) => (
                <TableCell
                  key={column.field}
                  sx={{
                    flex: column.width ? `0 0 ${column.width}` : "1",
                    maxWidth: column.width
                      ? typeof column.width === "number"
                        ? `${column.width * 100}px`
                        : column.width
                      : "none",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {item[column.field]}
                </TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell
                style={{ paddingBottom: 0, paddingTop: 0 }}
                colSpan={columns.length + 1}
              >
                <Collapse in={openRows[item.id]} timeout="auto" unmountOnExit>
                  {renderRowDetail ? renderRowDetail(item) : null}
                </Collapse>
              </TableCell>
            </TableRow>
          </React.Fragment>
        ))}
      </TableBody>
    </Table>
  );
};

export default ExpandableTable;
