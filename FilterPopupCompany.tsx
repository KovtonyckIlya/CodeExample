import React, { useEffect, useRef } from "react";
import "./FilterPopupCompany.scss";
import useTypedSelector from "../../../utils/hooks/useTypedSelector";
import SelectedSvg from "../../Svg/SelectedSvg";
import { useDispatch } from "react-redux";
import {
  deleteSelectedCompaniesAC,
  setSelectedCompanyAC, setShowFilterCompanyAC,
  setShowFilterRolesAC
} from "../../../redux/reducers/configReducer/profReducer";
import CheckedDealLenderSvg from "../../Svg/CheckedDealLenderSvg";
import UncheckedDealLenderSvg from "../../Svg/UncheckedDealLenderSvg";

function useOutsideClick(ref: any) {
  const dispatch = useDispatch();

  useEffect(() => {
    function handleClickOutside(event: any) {
      if (ref.current && !ref.current.contains(event.target)) {
        dispatch(setShowFilterCompanyAC(false));
      }
    }

    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref]);
}

const FilterPopupCompany = () => {

  const wrapperRef = useRef<any>(null);
  useOutsideClick(wrapperRef);
  const companyList = useTypedSelector(state => state.ConfigReducer.ProfReducer.companyList);
  const selectedCompanies = useTypedSelector(state => state.ConfigReducer.ProfReducer.selectedCompanies);
  const dispatch = useDispatch();

  const handleSelectCompany = (el: boolean | React.ReactChild | React.ReactFragment | React.ReactPortal | null | undefined) => {

    if (selectedCompanies.includes(el as string)) {
      dispatch(deleteSelectedCompaniesAC(el as string));
    } else {
      dispatch(setSelectedCompanyAC(el as string));
    }
  };

  return <div ref={wrapperRef} className={"filterPopupCompanyBox"}>
    {
      companyList.map((el: boolean | React.ReactChild | React.ReactFragment | React.ReactPortal | null | undefined, index) => {
        return <p
          onClick={() => {
            handleSelectCompany(el);
          }
          }
          className={`companyItem company-item-${index}`}>
          {selectedCompanies.includes(el as string) &&
          <div className={"companyItemCheckbox"}><CheckedDealLenderSvg/></div>
          }
          {!selectedCompanies.includes(el as string) &&
          <div className={"companyItemCheckbox"}><UncheckedDealLenderSvg/></div>}
          <p className={"companyItemParagraph"}>{el}</p>

        </p>;
      })
    }
  </div>;
};


export default FilterPopupCompany;
