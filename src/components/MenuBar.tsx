import React, { useState, useRef, useEffect } from 'react';
import styled from '@emotion/styled';
import { ChevronRight } from 'react-bootstrap-icons';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import useTabStore from './useTabStore'; // Import the tab store

const MenuBarContainer = styled.div`
  display: flex;
  align-items: center;
`;

const MenuItemContainer = styled.div`
  position: relative;
  align-items: stretch;
  align-self: stretch;
  padding: 0 12px;
  cursor: pointer;
  display: flex;
  background-color: ${({ isOpen }) => isOpen ? 'var(--highlight-dark-color)' : 'transparent'};
`;

const MenuItemTitle = styled.span`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SubMenu = styled.div`
  position: absolute;
  top: ${({ isTopLevel }) => isTopLevel ? '100%' : '0'};
  left: ${({ isTopLevel }) => isTopLevel ? '0' : '100%'};
  background-color: var(--highlight-dark-color);
  display: ${({ isOpen }) => (isOpen ? 'block' : 'none')};
  z-index: 1;
  min-width: 200px;
`;

const SubMenuItem = styled.div`
  padding: 8px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;

  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }
`;

const ChevronIcon = styled(ChevronRight)`
  margin-left: auto;
`;

const MenuBar = ({ items }) => {
  const [openMenus, setOpenMenus] = useState([]);
  const menuRefs = useRef([]);

  const handleMenuItemClick = (path, event) => {
    event.stopPropagation();
    setOpenMenus((prevOpenMenus) => {
      const newOpenMenus = prevOpenMenus.filter((menu) => {
        const menuPath = menu.join(',');
        const clickedPath = path.join(',');
        return menuPath === clickedPath || clickedPath.startsWith(menuPath + ',');
      });

      const index = newOpenMenus.findIndex((menu) => menu.join(',') === path.join(','));
      if (index !== -1) {
        return newOpenMenus.slice(0, index);
      } else {
        return [...newOpenMenus, path];
      }
    });
  };

  const handleClickOutside = (event) => {
    if (menuRefs.current.every((ref) => ref && !ref.contains(event.target))) {
      setOpenMenus([]);
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const renderSubMenu = (subItems, path = []) => {
    const currentPath = path.join(',');
    const isOpen = openMenus.some((menu) => menu.join(',').startsWith(currentPath));
    const isTopLevel = path.length === 1;

    return (
      <SubMenu
        isOpen={isOpen}
        isTopLevel={isTopLevel}
        ref={(ref) => (menuRefs.current[path.length - 1] = ref)}
      >
        {subItems.map((subItem, subIndex) => {
          const newPath = [...path, subIndex];
          return (
            <SubMenuItem
              key={subIndex}
              onClick={(event) => {
                event.stopPropagation();
                if (subItem.action) {
                  subItem.action();
                  setOpenMenus([]);
                } else if (subItem.children) {
                  handleMenuItemClick(newPath, event);
                }
              }}
            >
              <div className="icon">{subItem.icon && <subItem.icon />}</div>
              <div className="title">{subItem.title}</div>
              {subItem.children && <ChevronIcon />}
              {subItem.children && renderSubMenu(subItem.children, newPath)}
            </SubMenuItem>
          );
        })}
      </SubMenu>
    );
  };

  return (
    <MenuBarContainer>
      {items.map((item, index) => (
        <MenuItemContainer
          key={index}
          onClick={(event) => handleMenuItemClick([index], event)}
          isOpen={openMenus.some((menu) => menu[0] === index)}
        >
          <MenuItemTitle>
            <div className="icon">{item.icon && <item.icon />}</div>
            <div className="title"><span>{item.title}</span></div>
          </MenuItemTitle>
          {item.children && renderSubMenu(item.children, [index])}
        </MenuItemContainer>
      ))}
    </MenuBarContainer>
  );
};

export default MenuBar;