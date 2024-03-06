import React, { useEffect, useState } from "react";
import { Stack } from "@mui/material";
import { useLayers } from "../../../context";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { LayerCard } from "./layer-card";
// import { HurricaneCard } from "./hurricane-card";
import { addStormLayers } from "../../utils/storm-layers";
import DeleteIcon from "@mui/icons-material/Delete";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";

export const LayersList = ({ viewState, terria, stormLayers, setStormLayers }) => {
  const {
    activatedLayer,
    setActivatedLayer,
    setWebMapCatalogItems,
    toggleLayerSelection,
    checkedLayers,
    setCheckedLayers
  } = useLayers();
  const [checked, setChecked] = React.useState(false);
  const [disableDelete, setDisableDelete] = React.useState(true);
  const [addHurricaneLayers, setAddHurricaneLayers] = React.useState(true);
  const [clearGraph, setClearGraph] = React.useState("");
  const [hurricaneLayers, setHurricaneLayers] = React.useState([]);
  const [addedCards, setAddedCards] = useState([]);
  // const [stormLayers, setStormLayers] = useState([]);

  // useEffect(
  //   () => {
  //     // add any hurricane layers associated with
  //     // layers that are currently in the workbench

  //     viewState.terria.workbench.items.forEach((item) => {
  //       // look for storm layers
  //       // right now base identification on length of Advisory
  //       // length should be 3 or less if it is a storm layer
  //       let test = stormLayers.includes(item.uniqueId)

  //       if (
  //         item.infoAsObject.Advisory &&
  //         item.infoAsObject.Advisory.length < 4
  //       ) {

  //         // now add storm layers associated with this storm, date and advisory
  //         if (test == false) {
  //           setStormLayers([...stormLayers, item.uniqueId])
  //           // setStormLayers2([...stormLayers2, item])
  //           addStormLayers(viewState, item);
  //         }
  //       }
  //     });

  //     // stormLayers2.forEach(item => {
  //     //   let test = addedLayers.includes(item.uniqueId)
  //     //   if (test == false) {
  //     //     setAddedLayers([...addedLayers, item.uniqueId])
  //     //     addStormLayers(viewState, item);
  //     //   }
  //     // })
  //   }, [viewState.terria.workbench.items]
  // );

  useEffect(() => {
    const csvType = viewState.terria.workbench.items.find(
      (element) => element.type == "csv"
    );
    if (clearGraph !== csvType) {
      // Used to clear the old plot point from the graph
      let csvLayers = viewState.terria.workbench.items.map((layer) => {
        if (layer.type === "csv") {
          return layer;
        }
      });
      csvLayers.forEach((layer, i) => {
        if (i > 0) {
          viewState.terria.workbench.remove(layer);
        }
      });
      setClearGraph(csvType);
    }
  }, [viewState.terria.workbench.items]);

  // useEffect(() => {
  //   viewState.terria.workbench.items.map(item=>{
  //     let newArr = checkedLayers.filter((o) => o.id !== item.id);

  //     setCheckedLayers([
  //       ...newArr,
  //       {
  //         id: item.id,
  //         checked: false
  //       }
  //     ]);
  //   })

  // }, [viewState.terria.workbench.items]);

  // useEffect(
  //   () => {
  //     // add any hurricane layers associated with
  //     // layers that are currently in the workbench
  //     viewState.terria.workbench.items.map((item) => {
  //       // look for storm layers
  //       // right now base identification on length of Advisory
  //       // length should be 3 or less if it is a storm layer
  //       if (
  //         item.infoAsObject.Advisory &&
  //         item.infoAsObject.Advisory.length < 4
  //       ) {
  //         if (addHurricaneLayers) {
  //           // now add storm layers associated with this storm, date and advisory
  //           addStormLayers(viewState, item);
  //         }
  //       }
  //     });
  //   },
  //   [viewState.terria.workbench.items],
  //   addHurricaneLayers
  // );

  const handleSelectAll = (e) => {
    if (checked === false) {
      setChecked(true);
      setDisableDelete(false);
      checkedLayers.forEach((l) => {
        if (l.checked !== true) {
          l.checked = true;
          l.setChecked(true);
        }
      });
    } else {
      setChecked(false);
      setDisableDelete(true);
      checkedLayers.forEach((l) => {
        if (l.checked === true) {
          l.checked = false;
          l.setChecked(false);
        }
      });
    }
  };

  // const handleDelete = (e) => {
  //   checkedLayers.forEach((l) => {
  //     if (l.checked === true) {
  //       l.delete();
  //     }
  //   });
  // };

  const onDragEnd = (props) => {
    // dropped outside the list
    if (!props.destination) {
      return;
    }

    const layer = viewState.terria.workbench.items.find((item) => {
      return item.uniqueId === props.draggableId;
    });

    viewState.terria.workbench.moveItemToIndex(layer, props.destination.index);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="droppable">
        {(provided, snapshot) => (
          <Stack
            terria={terria}
            spacing={1}
            padding={1}
            useFlexGap
            sx={{
              overflowY: "auto",
              height: "100%",
              width: "100%",
              background: snapshot.isDraggingOver ? "lightblue" : "#585858",
              maxWidth: "fit-content"
            }}
            {...provided.droppableProps}
            ref={provided.innerRef}
          >
            {/* <div
              style={{
                display: "flex",
                "justify-content": "start",
                columnGap: "10px"
              }}
            >
              <Checkbox
                sx={{
                  color: "#008daa",
                  "&.Mui-checked": {
                    color: "#008daa"
                  }
                }}
                checked={checked}
                onChange={handleSelectAll}
                inputProps={{ "aria-label": "controlled" }}
              />
              <Button
                aria-label="delete"
                disabled={disableDelete}
                style={{
                  backgroundColor: "rgb(211 47 47 / 39%)",
                  fontSize: "12px",
                  width: "65px"
                }}
                onClick={handleDelete}
                variant="contained"
              >
                <DeleteIcon />
              </Button>
            </div> */}
            {viewState.terria &&
              viewState.terria.workbench.items.map(
                (layer, index) => {
                  let test = addedCards.includes(layer.uniqueId);
                  if (layer.infoAsObject.Advisory &&
                    layer.infoAsObject.Advisory.length < 4 && test == false ) {
                    setAddedCards([...addedCards, layer.uniqueId])
                    return (
                      <Draggable
                        key={layer.uniqueId + index}
                        draggableId={layer.uniqueId + index}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{
                              background: snapshot.isDragging
                                ? "lightgreen"
                                : "#585858",
                              ...provided.draggableProps.style
                            }}
                          >
                            <div id={layer.uniqueId + index}>
                              <LayerCard
                                activatedLayer={activatedLayer}
                                setActivatedLayer={setActivatedLayer}
                                setLayers={setWebMapCatalogItems}
                                viewState={viewState}
                                layer={layer}
                                id={layer.uniqueId + index}
                                title={layer.name}
                                checkedLayers={checkedLayers}
                                setCheckedLayers={setCheckedLayers}
                                setDisableDelete={setDisableDelete}
                                setAddHurricaneLayers={setAddHurricaneLayers}
                                items={viewState.terria.workbench.items}
                                index={index}
                                stormLayers={stormLayers}
                                setStormLayers={setStormLayers}
                              />
                            </div>
                          </div>
                        )}
                      </Draggable>
                    )
                  } else if (layer.type !== "csv") {
                    return (
                      <Draggable
                        key={layer.uniqueId + index}
                        draggableId={layer.uniqueId + index}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{
                              background: snapshot.isDragging
                                ? "lightgreen"
                                : "#585858",
                              ...provided.draggableProps.style
                            }}
                          >
                            <div id={layer.uniqueId + index}>
                              <LayerCard
                                activatedLayer={activatedLayer}
                                setActivatedLayer={setActivatedLayer}
                                setLayers={setWebMapCatalogItems}
                                viewState={viewState}
                                layer={layer}
                                id={layer.uniqueId + index}
                                title={layer.name}
                                checkedLayers={checkedLayers}
                                setCheckedLayers={setCheckedLayers}
                                setDisableDelete={setDisableDelete}
                                setAddHurricaneLayers={setAddHurricaneLayers}
                                items={viewState.terria.workbench.items}
                                stormLayers={stormLayers}
                                setStormLayers={setStormLayers}
                              />
                            </div>
                          </div>
                        )}
                      </Draggable>
                    )
                  }

                }
              )}
          </Stack>
        )}
      </Droppable>
    </DragDropContext>
  );
};
