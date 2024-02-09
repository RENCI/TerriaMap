import { Box } from "@mui/material";
import React, { useState } from "react";
import ChartPanel from "terriajs/lib/ReactViews/Custom/Chart/ChartPanel";
import ChartView from "terriajs/lib/Charts/ChartView";
import Checkbox from "@mui/material/Checkbox";

const label = { inputProps: { "aria-label": "Checkbox" } };

export const ChartItem = ({ chartItem }) => {
  const [shouldSelect, setShouldSelect] = useState(true);
  const lineColor = shouldSelect ? chartItem.getColor() : "#fff";

  const toggleActive = () => {
    const catalogItem = chartItem.item;
    chartItem.updateIsSelectedInWorkbench(!shouldSelect);
    if (shouldSelect) {
      setShouldSelect(false);
      unselectChartItemsWithXAxisNotMatching(
        catalogItem.terria.workbench.items,
        chartItem.xAxis
      );
    } else {
      setShouldSelect(true);
    }
  };

  return (
    <div>
      <Checkbox
        sx={{
          color: "white",
          "&.Mui-checked": {
            color: lineColor
          }
        }}
        onChange={toggleActive}
        {...label}
        checked={shouldSelect}
      />
      <span style={{ color: lineColor }}>{chartItem.name}</span>
    </div>
  );
};

export const GraphTab = ({ viewState, terria }) => {
  const chartView = new ChartView(viewState.terria.workbench.items[0].terria);
  const chartItems = chartView.chartItems;

  return (
    <Box sx={{ height: "294px", overflow: "auto" }}>
      {chartItems.length > 0 && (
        <h1
          style={{
            fontSize: "1rem",
            color: "white",
            textAlign: "center"
          }}
        >
          {chartItems[0].categoryName}
        </h1>
      )}
      <div
        style={{
          display: "flex",
          justifyContent: "space-evenly",
          margin: "10px 10px 0 10px"
        }}
      >
        {chartItems.map((chartItem) => {
          return (
            <div key={`li-${chartItem.key}`}>
              <ChartItem chartItem={chartItem} />
            </div>
          );
        })}
      </div>
      <ChartPanel terria={terria} viewState={viewState} />
    </Box>
  );
};
