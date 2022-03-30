import React, { useEffect, useRef } from "react";
import "./FilterPopupRole.scss";
import useTypedSelector from "../../../utils/hooks/useTypedSelector";
import { useDispatch } from "react-redux";
import {
  deleteSelectedRolesAC,
  setSelectedRolesAC, setShowFilterRolesAC
} from "../../../redux/reducers/configReducer/profReducer";
import CheckedDealLenderSvg from "../../Svg/CheckedDealLenderSvg";
import UncheckedDealLenderSvg from "../../Svg/UncheckedDealLenderSvg";

function useOutsideClick(ref: any) {
  const dispatch = useDispatch();

  useEffect(() => {
    function handleClickOutside(event: any) {
      if (ref.current && !ref.current.contains(event.target)) {
        dispatch(setShowFilterRolesAC(false));
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

const FilterPopupRole = () => {
  const wrapperRef = useRef<any>(null);
  useOutsideClick(wrapperRef);

  const rolesList = useTypedSelector(state => state.ConfigReducer.ProfReducer.rolesList);
  const selectedRoles = useTypedSelector(state => state.ConfigReducer.ProfReducer.selectedRoles);
  const dispatch = useDispatch();

  const handleSelectCompany = (el: boolean | React.ReactChild | React.ReactFragment | React.ReactPortal | null | undefined) => {
    if (selectedRoles.includes(el as string)) {
      dispatch(deleteSelectedRolesAC(el as string));
    } else {
      dispatch(setSelectedRolesAC(el as string));
    }
  };


  return (
    <div  ref={wrapperRef} className={"filterPopupRoleBox"}>
      {
        rolesList.map((el: boolean | React.ReactChild | React.ReactFragment | React.ReactPortal | null | undefined, index) => {
          return <p
            onClick={(e) => {
              e.stopPropagation()
              handleSelectCompany(el);
            }
            }
            className={`roleItem role-item-${index}`}>
            {selectedRoles.includes(el as string) &&
            <div className={"roleItemCheckbox"}><CheckedDealLenderSvg/></div>
            }
            {!selectedRoles.includes(el as string) &&
            <div className={"roleItemCheckbox"}><UncheckedDealLenderSvg/></div>}
            <p className={"roleItemParagraph"}>{el}</p>

          </p>;
        })
      }
    </div>
  );
};


export default FilterPopupRole;
