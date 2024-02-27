import { Box } from "@mui/material";
import React, { useState, useEffect } from "react";
import ChartPanel from "terriajs/lib/ReactViews/Custom/Chart/ChartPanel";
import ChartView from "terriajs/lib/Charts/ChartView";
import Checkbox from "@mui/material/Checkbox";
import { useLayers } from "../../../../context";
import Legend from "terriajs/lib/ReactViews/Workbench/Controls/Legend";
import ChartItemSelector from "terriajs/lib/ReactViews/Workbench/Controls/ChartItemSelector";

const label = { inputProps: { "aria-label": "Checkbox" } };

export const ChartItem = ({ chartItem }) => {
  const [shouldSelect, setShouldSelect] = useState(
    chartItem.isSelectedInWorkbench
  );
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

export const GraphTab = ({ viewState, terria, chartItems }) => {
  const { setChartItems } = useLayers();
  const chartView = new ChartView(terria);
  const chartItems2 = chartView.chartItems;

  useEffect(() => {
    setChartItems(chartItems2);
  }, []);

  return (
    <Box sx={{ height: "400px", overflow: "auto" }}>
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
