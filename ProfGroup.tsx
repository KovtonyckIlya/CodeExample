import { useState, useEffect, useRef, useMemo, MouseEvent } from "react";
import ProfCard from "../ProfCard/ProfCard";
import { baseURL } from "../../../api";
import axios from "axios";
import { withSnackbar } from "notistack";
import { NavLink } from "react-router-dom";
// SVG
import Pencil from "../../Svg/Pencil";
import TrashFolder from "../../Svg/TrashFolder";
import SortChevronUp from "../../Svg/SortChevronUp";
import SortChevronDown from "../../Svg/SortChevronDown";
import FilterPopupRole from "./FilterPopupRole";
import {
  getCompaniesListTC,
  getRolesListTC,
  Professional,
  setSelectedProfForDealsAC,
  setShowFilterCompanyAC,
  setShowFilterRolesAC,
  handleFetchProff
} from "../../../redux/reducers/configReducer/profReducer";
import { useSnackbar } from "notistack";
import useTypedSelector from "../../../utils/hooks/useTypedSelector";
import { useDispatch } from "react-redux";
import FilterPopupCompany from "./FilterPopupCompany";
import { makeQueryString } from "../../../utils/makeQueryString";
import IsNoFilterSvg from "../../Svg/IsNoFilterSvg";
import IsFilterSvg from "../../Svg/IsFilterSvg";
import SortChevronDefault from "../../Svg/SortChevronDefault";
import EmailHoverComponent from "./EmailHoverComponent/EmailHoverComponent";
import { styled} from "@mui/system";

interface ProfGroupProps{
  searchData: any,
  addProf:any,
  clearSelectedRole: () => void;
}
const ProfGroup = ({ searchData, addProf, clearSelectedRole }:ProfGroupProps) => {
  const [updateList, setUpdateList] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const [editRole, setEditRole] = useState(null);
  const [newProf, setNewProf] = useState(null);
  const [profList, setProfList] = useState<[] | null>(null);
  const [profListMapped, setProfListMapped] = useState([]);
  const profListMap = useRef(new Map()).current;
  const [toggleConfirm, setToggleConfirm] = useState(false);
  const [deleteID, setDeleteID] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedSortValue, setSelectedSortValue] = useState<string | undefined>(undefined);
  const [selectedSortType, setSelectedSortType] = useState("");
  const dispatch = useDispatch();
  const showFilterRolesPopup = useTypedSelector((state) => state.ConfigReducer.ProfReducer.showFilterRolesPopup);
  const showFilterCompanyPopup = useTypedSelector((state) => state.ConfigReducer.ProfReducer.showFilterCompanyPopup);
  const selectedRoles = useTypedSelector((state) => state.ConfigReducer.ProfReducer.selectedRoles);
  const selectedCompanies = useTypedSelector((state) => state.ConfigReducer.ProfReducer.selectedCompanies);
  const sortedProff = useTypedSelector((state) => state.ConfigReducer.ProfReducer.sortedProff);
  const [selectedRolesString, setSelectedRolesString] = useState<string | undefined>(undefined);
  const [selectedCompaniesString, setSelectedCompaniesString] = useState<string | undefined>(undefined);
  const [data, setData] = useState([]);
  useEffect(() => {
    setSelectedRolesString(() => {
      if (selectedRoles.length > 0) {
        return selectedRoles.join();
      } else {
        return undefined;
      }
    });
  }, [selectedRoles]);
  useEffect(() => {
    setSelectedCompaniesString(() => {
      if (selectedCompanies.length > 0) {
        return selectedCompanies.join();
      } else {
        return undefined;
      }
    });
  }, [selectedCompanies]);

  const nextPage = () => {
    if (currentPage === total) return;
    if (currentPage <= total) setCurrentPage((prevState) => prevState + 1);
  };
  useEffect(() => {
    const queryString = makeQueryString(sortObject);
    dispatch(getCompaniesListTC());
    dispatch(getRolesListTC());
    dispatch(handleFetchProff(queryString))

  }, [dispatch]);
  const handleLinkClicked = (el: Professional | null) => {
    dispatch(setSelectedProfForDealsAC(el));
  };
  const sortObject = useMemo(() => {
    return {
      search: searchData.value,
      tab: "professionals",
      page: currentPage,
      orderby: selectedSortValue,
      order: selectedSortType,
      role: selectedRolesString,
      company: selectedCompaniesString,
    };
  }, [
    searchData.value,
    currentPage,
    selectedSortValue,
    selectedSortType,
    selectedRolesString,
    selectedCompaniesString,
  ]);

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevState) => prevState - 1);
    }
  };
  const cardData = () => {
    if (editRole) {
      return {
        edit: true,
        editRole,
      };
    }
    if (newProf) {
      return {
        edit: false,
      };
    }
    return false;
  };
  const cardVisibility = newProf !== null || editRole !== null ? true : false;

  const handleCardClose = () => {
    profListMap.clear();
    setEditRole(null);
    setNewProf(null);
    clearSelectedRole(null);
    setUpdateList(true);
  };
  const handleFetchProfSort = () => {
    const queryString = makeQueryString(sortObject);
    dispatch(handleFetchProff(queryString))
    const { last_page, data } = sortedProff;

        setUpdateList(false);
        if (searchData.value === "") {
          profListMap.clear();
        } else {
          profListMap.set(searchData.value, data);
        }
        if (searchData.value !== "") {
        }
        setProfList(data);

        setTotal(last_page);
      
  };

  const handleDeleteProf = () => {
    setUpdateList(true);
    axios
      .post(`${baseURL}/config/users/${deleteID}/delete`)
      .then((res) => {
        setToggleConfirm(!toggleConfirm);
        enqueueSnackbar("Delete professional", {
          variant: "success",
          autoHideDuration: 1500,
        });

        handleFetchProfSort();
      })
      .catch((error) => {
        setToggleConfirm(!toggleConfirm);
        enqueueSnackbar(error && error.response && error.response.data && error.response.data.error, {
          variant: "error",
          autoHideDuration: 2000,
        });

        handleFetchProfSort();

        return;
      });
  };

  const handleDeleteConfirm = (id:number) => {
    setToggleConfirm(!toggleConfirm);
    setDeleteID(id);
  };

  useEffect(() => {
    if (addProf) {
      setNewProf(addProf);
    }
    const queryString = makeQueryString(sortObject);
    if (searchData.role === "professional") {
      axios
        .get(`${baseURL}/config/users${queryString}`)
        .then((res) => {
          const { last_page, data } = res.data;
          if (searchData.value === "") {
            profListMap.clear();
          } else {
            profListMap.set(searchData.value, data);
          }
          if (searchData.value !== "") {
            setCurrentPage(1);
          }
          setProfList(data);
          setTotal(last_page);
        })
        .catch((error) => {});
    }
  }, [addProf, searchData]);

  const changeSort = (sort: string | undefined, direction: string) => {
    setSelectedSortType(() => {
      return direction;
    });
    setSelectedSortValue(() => {
      return sort;
    });
  };

  useEffect(() => {
    let isSubscribed = true;
    isSubscribed && handleFetchProfSort();
    return () => (isSubscribed = false);
  }, [
    newProf,
    editRole,
    currentPage,
    selectedSortValue,
    selectedSortType,
    selectedRolesString,
    selectedCompaniesString,
  ]);

  const Loader = () => {
    return (
      <div style={{ display: "flex" }}>
        <img
          style={{ width: "120px", margin: "auto" }}
          src="https://tlap.com/wp-content/themes/smartone/images/spinner.gif"
          alt="Loading"
        />
      </div>
    );
  };
  const handleOnMouseOver = (e: MouseEvent<HTMLDivElement, globalThis.MouseEvent>, index:number) => {
    e.preventDefault();
    e.stopPropagation();
    let copyProfListMapped = [...profListMapped];
    copyProfListMapped = copyProfListMapped.map((x) => {
      x.isEmailPopoverShow = false;
      return x;
    });
    copyProfListMapped[index].isEmailPopoverShow = true;

    setProfListMapped(copyProfListMapped);
  };

  const handleOnMouseOut = (e: MouseEvent<HTMLLIElement, MouseEvent>) => {
    e.preventDefault();
    e.stopPropagation();
    let copyProfListMapped = [...profListMapped];
    copyProfListMapped = copyProfListMapped.map((x) => {
      x.isEmailPopoverShow = false;
      return x;
    });
    setProfListMapped(copyProfListMapped);
  };

  useEffect(() => {
    if (profList && profList.length) {
      let copyProfList = [...profList];
      copyProfList = copyProfList.map((prof, index) => {
        prof.isEmailPopoverShow = false;
        return prof;
      });
      setProfListMapped(copyProfList);
    }
  }, [profList]);
  const ProffGroupList = styled("div")({
    background: "#FFFFFF",
    marginBottom: "3rem",
  });
  const ProffGroupHeader = styled("div")({
    display: "flex",
    padding: " 1.5rem 2rem",
    background: "#FFFFFF",
    marginBottom: "0.5rem",
    marginRight: "1.5rem"
    // marginRight:"1.5rem"
  });
  const ProffsGroupItems = styled("ul")({
    listStyle: "none",
    height: "72rem",
    paddingRight:"1rem"
  });
  const ProffGroupItem = styled("li")({
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "1.5rem 2rem",
    background: "",
    boxShadow: " 0px 2px 10px rgba(0, 0, 0, 0.08)",
    marginBottom: "0.5rem",
    "&:hover": {
      boxShadow: "0px 4px 4px rgba(79, 79, 79, 0.25)",
    },
  });
  const ContentItemIcon = styled("div")({
    flex: " 0 1 4rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  });


  const SelectedSortValue = styled("div")({
    position: selectedSortValue === "full_name" ? "relative" : undefined,
    display: "flex",
    flex: 1,
    fontFamily: "Montserrat",
    fontStyle: "normal",
    fontWeight: "400",
    fontSize: "14px",
    lineHeight: "17px",
    alignItems: "center",
    color: selectedSortValue === "full_name" ? " #333333" : "#828282",
    lineBreak: "anywhere",
    marginRight: " 1rem",
  });
  const ChevronBox = styled("div")({
    display: "flex",
    flexDirection: "column",
    marginLeft: "10px",
    width: "14px",
  });
  const ChevronBoxDefault = styled("div")({
    cursor: "pointer",
    marginTop: "-3px",
    marginLeft: " -4px ",
  });
  const ChevronUp = styled("div")({
    cursor: "pointer",
    marginTop: "-3px",
    marginLeft: " -4px ",
  });
  const ChevronDown = styled("div")({
    cursor: "pointer",
    marginTop: "-3px",
    marginLeft: " -4px ",
  });
  const SelectedSortedValue = styled("div")({
    position: selectedSortValue === "role" ? "relative" : undefined,
    display: "flex",
    flex: 1,
    fontFamily: "Montserrat",
    fontStyle: "normal",
    fontWeight: "500",
    fontSize: "14px",
    lineHeight: "17px",
    alignItems: "center",
    color: selectedSortValue === "role" ? " #333333" : "#828282",
    lineBreak: "anywhere",
    marginRight: " 1rem",
  });
  const SelectedLastDeal = styled("div")({
    position: selectedSortValue === "last_deal" ? "relative" : undefined,
    display: "flex",
    flex: 1,
    fontFamily: "Montserrat",
    fontStyle: "normal",
    fontWeight: "500",
    fontSize: "14px",
    lineHeight: "17px",
    alignItems: "center",
    color: selectedSortValue === "last_deal" ? " #333333" : "#828282",
    lineBreak: "anywhere",
    marginRight: " 1rem",
  });
  const SelectedClosingDate = styled("div")({
    position: selectedSortValue === "closing_date" ? "relative" : undefined,
    display: "flex",
    flex: 1,
    fontFamily: "Montserrat",
    fontStyle: "normal",
    fontWeight: "500",
    fontSize: "14px",
    lineHeight: "17px",
    alignItems: "center",
    color: selectedSortValue === "closing_date" ? " #333333" : "#828282",
    lineBreak: "anywhere",
    marginRight: " 1rem",
  });
  const SelectedEmail = styled("div")({
    position: selectedSortValue === "email" ? "relative" : undefined,
    display: "flex",
    flex: 1,
    fontFamily: "Montserrat",
    fontStyle: "normal",
    fontWeight: "500",
    fontSize: "14px",
    lineHeight: "17px",
    alignItems: "center",
    color: selectedSortValue === "email" ? " #333333" : "#828282",
    lineBreak: "anywhere",
    marginRight: " 1rem",
  });
  const SelectedCompany = styled("div")({
    position: "relative",
    display: "flex",
    flex: 1,
    fontFamily: "Montserrat",
    fontStyle: "normal",
    fontWeight: "500",
    fontSize: "14px",
    lineHeight: "17px",
    alignItems: "center",
    color: selectedSortValue === "company" ? " #333333" : "#828282",
    lineBreak: "anywhere",
    marginRight: " 1rem",
    justifyContent: selectedSortValue === "company" ? "center" : null,
  });
  const SelectedDateCreated = styled("div")({
    position: selectedSortValue === "date_created" ? "relative" : undefined,
    display: "flex",
    flex: 1,
    fontFamily: "Montserrat",
    fontStyle: "normal",
    fontWeight: "500",
    fontSize: "14px",
    lineHeight: "17px",
    alignItems: "center",
    color: selectedSortValue === "date_created" ? " #333333" : "#828282",
    lineBreak: "anywhere",
    marginRight: " 1rem",
  });
  const SelectedTotalDateCreated = styled("div")({
    position: selectedSortValue === "total_deals deal_center" ? "relative" : undefined,
    display: "flex",
    flex: 1,
    fontFamily: "Montserrat",
    fontStyle: "normal",
    fontWeight: "500",
    fontSize: "14px",
    lineHeight: "17px",
    alignItems: "center",
    color: selectedSortValue === "total_deals deal_center" ? " #333333" : "#828282",
    lineBreak: "anywhere",
    marginRight: "1rem",
    justifyContent: selectedSortValue === "total_deals deal_center" ? "center" : null,
  });
  const SelectedItem = styled("div")({
    flex: 1,
    alignItems: "center",
    display: "flex",
    fontFamily: "Montserrat",
    fontStyle: "normal",
    fontWeight: "500",
    fontSize: "14px",
    lineHeight: "17px",
    lineBreak: "anywhere",
    marginRight: " 1rem",
  });
  const DeleteWrapper = styled("div")({
    position: "fixed",
    zIndex: 9,
    top: 0,
    bottom: 0,
    height: "100%",
    display: "flex",
    width: "calc(100% - 21.7rem)",
    background: " rgba(0, 0, 0, 0.15)",
  });
  const DeleteBox = styled("div")({
    padding: " 1.5rem 2rem",
    margin: "auto",
    background: "#FFFFFF",
    border: "none",
    borderRadius: " 5px",
  });
  const DeleteTitle = styled("h2")({
    fontStyle: "normal",
    fontWeight: "normal",
    fontSize: "1.8rem",
    lineHeight: "2.5rem",
    textAlign: "center",
    latterSpacing: "1px",
  });
  const ConfirmWrapper = styled("div")({
    marginTop: "3rem",
    display: "flex",
    justifyContent: " space-around",
  });
  const ProffGroupWrapper = styled("div")({
    display: "flex",
    flexWrap: "wrap",
    flexDirection: "column",
    width: "100%",
    justifyContent: "space-between",
  });
  const ProffGroupPages = styled("div")({
    margin: "1rem auto",
    textAlign: "center",
    color: " #4F4F4F",
  });
  const CurrentPage = styled("span")({
    color: "#F16764",
    fontSize: "18px",
    lineHeight: "22px",
    margin: "0.2rem",
    fontStyle: "normal",
    fontWeight: "500",
  });
  const ProffEditCard = styled("div")({
    position: "fixed",
    zIndex: 9,
    top: 0,
    bottom: 0,
    height: "100%",
    display: "flex",
    alignItems:"center",
    flexDirection:"row",
    justifyContent:"center",
    width: "calc(100% - 21.7rem)",
    background: " rgba(0, 0, 0, 0.15)",
     padding:" 5rem 0rem 10rem"
  })
  return (
    <ProffGroupWrapper>
      {toggleConfirm && (
        <DeleteWrapper>
          <DeleteBox>
            <DeleteTitle>Please confirm "delete professional"</DeleteTitle>
            <ConfirmWrapper>
              <button className="yes" style={{ backgroundColor: "#02cd8f", color: "#fff" }} onClick={handleDeleteProf}>
                Yes
              </button>
              <button
                className="no"
                style={{ border: "1px solid #d9d9d9" }}
                onClick={() => setToggleConfirm(!toggleConfirm)}
              >
                No
              </button>
            </ConfirmWrapper>
          </DeleteBox>
        </DeleteWrapper>
      )}
      <ProffGroupList>
        <ProffGroupHeader>
          {/* eslint-disable-next-line no-useless-concat */}
          <SelectedSortValue>
            Name
            <ChevronBox>
              {selectedSortValue !== "full_name" && (
                <ChevronBoxDefault
                  onClick={() => {
                    changeSort("full_name", "asc");
                  }}
                >
                  <SortChevronDefault />
                </ChevronBoxDefault>
              )}
              {selectedSortValue === "full_name" && selectedSortType === "desc" && (
                <ChevronUp
                  onClick={() => {
                    changeSort("full_name", "asc");
                  }}
                >
                  <SortChevronUp />
                </ChevronUp>
              )}
              {selectedSortValue === "full_name" && selectedSortType === "asc" && (
                <ChevronDown
                  onClick={() => {
                    changeSort("full_name", "desc");
                  }}
                >
                  <SortChevronDown />
                </ChevronDown>
              )}
            </ChevronBox>
          </SelectedSortValue>
          <SelectedSortedValue>
            {selectedRoles.length === 0 && (
              <div style={{ marginRight: "6px" }}>
                <IsNoFilterSvg />
              </div>
            )}
            {selectedRoles.length !== 0 && (
              <div style={{ marginRight: "6px" }}>
                <IsFilterSvg />
              </div>
            )}
            <span
              style={{ cursor: "pointer" }}
              onMouseDown={(e) => {
                e.stopPropagation();
                dispatch(setShowFilterCompanyAC(false));
                dispatch(setShowFilterRolesAC(!showFilterRolesPopup));
              }}
            >
              Role
            </span>
            <ChevronBox>
              {selectedSortValue !== "role" && (
                <ChevronBoxDefault
                  onClick={() => {
                    changeSort("role", "asc");
                  }}
                >
                  <SortChevronDefault />
                </ChevronBoxDefault>
              )}
              {selectedSortValue === "role" && selectedSortType === "desc" && (
                <ChevronUp
                  onClick={() => {
                    changeSort("role", "asc");
                  }}
                >
                  <SortChevronUp />
                </ChevronUp>
              )}
              {selectedSortValue === "role" && selectedSortType === "asc" && (
                <ChevronDown
                  onClick={() => {
                    changeSort("role", "desc");
                  }}
                >
                  <SortChevronDown />
                </ChevronDown>
              )}
            </ChevronBox>
            {showFilterRolesPopup && <FilterPopupRole />}
          </SelectedSortedValue>
          <SelectedEmail>
            Email
            <ChevronBox>
              {selectedSortValue !== "email" && (
                <ChevronBoxDefault
                  onClick={() => {
                    changeSort("email", "asc");
                  }}
                >
                  <SortChevronDefault />
                </ChevronBoxDefault>
              )}
              {selectedSortValue === "email" && selectedSortType === "desc" && (
                <ChevronUp
                  onClick={() => {
                    changeSort("email", "asc");
                  }}
                >
                  <SortChevronUp />
                </ChevronUp>
              )}
              {selectedSortValue === "email" && selectedSortType === "asc" && (
                <ChevronDown
                  onClick={() => {
                    changeSort("email", "desc");
                  }}
                >
                  <SortChevronDown />
                </ChevronDown>
              )}
            </ChevronBox>
          </SelectedEmail>
          <SelectedCompany>
            {selectedCompanies.length === 0 && (
              <div>
                <IsNoFilterSvg />
              </div>
            )}
            {selectedCompanies.length !== 0 && (
              <div>
                <IsFilterSvg />
              </div>
            )}
            <span
              style={{ cursor: "pointer" }}
              onMouseDown={() => {
                dispatch(setShowFilterRolesAC(false));
                dispatch(setShowFilterCompanyAC(!showFilterCompanyPopup));
              }}
            >
              Company
            </span>

            <ChevronBox>
              {selectedSortValue !== "company" && (
                <ChevronBoxDefault
                  onClick={() => {
                    changeSort("company", "asc");
                  }}
                >
                  <SortChevronDefault />
                </ChevronBoxDefault>
              )}
              {selectedSortValue === "company" && selectedSortType === "desc" && (
                <ChevronUp
                  onClick={() => {
                    changeSort("company", "asc");
                  }}
                >
                  <SortChevronUp />
                </ChevronUp>
              )}
              {selectedSortValue === "company" && selectedSortType === "asc" && (
                <ChevronDown
                  onClick={() => {
                    changeSort("company", "desc");
                  }}
                >
                  <SortChevronDown />
                </ChevronDown>
              )}
            </ChevronBox>
            {showFilterCompanyPopup && <FilterPopupCompany />}
          </SelectedCompany>
          <SelectedDateCreated>
            Date Created
            <ChevronBox>
              {selectedSortValue !== "date_created" && (
                <ChevronBoxDefault
                  onClick={() => {
                    changeSort("date_created", "asc");
                  }}
                >
                  <SortChevronDefault />
                </ChevronBoxDefault>
              )}
              {selectedSortValue === "date_created" && selectedSortType === "desc" && (
                <ChevronUp
                  onClick={() => {
                    changeSort("date_created", "asc");
                  }}
                >
                  <SortChevronUp />
                </ChevronUp>
              )}
              {selectedSortValue === "date_created" && selectedSortType === "asc" && (
                <ChevronDown
                  onClick={() => {
                    changeSort("date_created", "desc");
                  }}
                >
                  <SortChevronDown />
                </ChevronDown>
              )}
            </ChevronBox>
          </SelectedDateCreated>
          <SelectedLastDeal>
            Last Deal
            <ChevronBox>
              {selectedSortValue !== "last_deal" && (
                <ChevronBoxDefault
                  onClick={() => {
                    changeSort("last_deal", "asc");
                  }}
                >
                  <SortChevronDefault />
                </ChevronBoxDefault>
              )}
              {selectedSortValue === "last_deal" && selectedSortType === "desc" && (
                <ChevronUp
                  onClick={() => {
                    changeSort("last_deal", "asc");
                  }}
                >
                  <SortChevronUp />
                </ChevronUp>
              )}
              {selectedSortValue === "last_deal" && selectedSortType === "asc" && (
                <ChevronDown
                  onClick={() => {
                    changeSort("last_deal", "desc");
                  }}
                >
                  <SortChevronDown />
                </ChevronDown>
              )}
            </ChevronBox>
          </SelectedLastDeal>
          <SelectedClosingDate>
            Closing Date
            <ChevronBox>
              {selectedSortValue !== "closing_date" && (
                <ChevronBoxDefault
                  onClick={() => {
                    changeSort("closing_date", "asc");
                  }}
                >
                  <SortChevronDefault />
                </ChevronBoxDefault>
              )}
              {selectedSortValue === "closing_date" && selectedSortType === "desc" && (
                <ChevronUp
                  onClick={() => {
                    changeSort("closing_date", "asc");
                  }}
                >
                  <SortChevronUp />
                </ChevronUp>
              )}
              {selectedSortValue === "closing_date" && selectedSortType === "asc" && (
                <ChevronDown
                  onClick={() => {
                    changeSort("closing_date", "desc");
                  }}
                >
                  <SortChevronDown />
                </ChevronDown>
              )}
            </ChevronBox>
          </SelectedClosingDate>
          <SelectedTotalDateCreated>
            Deals
            <ChevronBox>
              {selectedSortValue !== "total_deals" && (
                <ChevronBoxDefault
                  onClick={() => {
                    changeSort("total_deals", "asc");
                  }}
                >
                  <SortChevronDefault />
                </ChevronBoxDefault>
              )}
              {selectedSortValue === "total_deals" && selectedSortType === "desc" && (
                <ChevronUp
                  onClick={() => {
                    changeSort("total_deals", "asc");
                  }}
                >
                  <SortChevronUp />
                </ChevronUp>
              )}
              {selectedSortValue === "total_deals" && selectedSortType === "asc" && (
                <ChevronDown
                  onClick={() => {
                    changeSort("total_deals", "desc");
                  }}
                >
                  <SortChevronDown />
                </ChevronDown>
              )}
            </ChevronBox>
          </SelectedTotalDateCreated>
          <ContentItemIcon></ContentItemIcon>
          <ContentItemIcon></ContentItemIcon>
        </ProffGroupHeader>

        <ProffsGroupItems>
          {!profList || updateList
            ? Loader()
            : (profListMap.get(searchData.value) ? profListMap.get(searchData.value) : profListMapped).map(
                (el, idx) => {
                  const {
                    full_name,
                    role,
                    email,
                    date_created,
                    last_deal,
                    closing_date,
                    total_deals,
                    id,
                    company,
                    deleted_at,
                    userpic,
                  } = el;
                  return (
                    <ProffGroupItem onMouseLeave={(e) => handleOnMouseOut(e)} key={idx}>
                      <SelectedItem>
                      {full_name}
                      </SelectedItem>
                      <SelectedItem>{role}</SelectedItem>
                      <div style={{ position: "relative" }}>
                        {el.isEmailPopoverShow && (
                          <EmailHoverComponent
                            handleOnMouseOut={handleOnMouseOut}
                            handleOnMouseOver={handleOnMouseOver}
                            email={email}
                            index={idx}
                          />
                        )}
                        <div
                          onMouseOver={(e) => handleOnMouseOver(e, idx)}
                          style={{
                            color: " #0563c1",
                            width: " 125px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {email}
                        </div>
                      </div>
                      <SelectedItem style={{ marginLeft: "50px" }}>{company}</SelectedItem>
                      <SelectedItem>{date_created}</SelectedItem>
                      <SelectedItem>{last_deal}</SelectedItem>
                      <SelectedItem>{closing_date}</SelectedItem>
                      {!deleted_at ? (
                        <SelectedItem>
                          <NavLink
                            style={{
                              fontFamily: "Montserrat",
                              fontStyle: "normal",
                              fontWeight: 500,
                              fontSize: "14px",
                              lineHeight: "17px",
                              color: " #2F80ED",
                            }}
                            onClick={() => {
                              handleLinkClicked(el);
                            }}
                            to={"/dashboard/deals"}
                          >
                            <div>{total_deals}</div>
                          </NavLink>
                        </SelectedItem>
                      ) : (
                        <SelectedItem>{total_deals}</SelectedItem>
                      )}

                      {!!deleted_at && <ContentItemIcon></ContentItemIcon>}
                      <ContentItemIcon onClick={() => setEditRole(el)}>
                        <Pencil />
                      </ContentItemIcon>
                      {!deleted_at && (
                        <ContentItemIcon onClick={() => handleDeleteConfirm(id)}>
                          <TrashFolder />
                        </ContentItemIcon>
                      )}
                    </ProffGroupItem>
                  );
                }
              )}
        </ProffsGroupItems>
        <ProffGroupPages>
          <i className="fas fa-chevron-left" onClick={() => prevPage()}></i>
          <CurrentPage>{currentPage}</CurrentPage>/ <CurrentPage>{total}</CurrentPage>
          <i className="fas fa-chevron-right" onClick={() => nextPage()}></i>
        </ProffGroupPages>
      </ProffGroupList>

      <ProffEditCard
        style={{
          display: cardVisibility ? "flex" : "none",
        }}
      >
        <ProfCard handleCardClose={handleCardClose} data={cardData()} />
      </ProffEditCard>
    </ProffGroupWrapper>
  );
};
export default ProfGroup;
