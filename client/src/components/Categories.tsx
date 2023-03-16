import CodeIcon from '@mui/icons-material/Code';
import StorageIcon from '@mui/icons-material/Storage';
import YouTubeIcon from '@mui/icons-material/YouTube';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import ReorderIcon from '@mui/icons-material/Reorder';

const Categories = ( { searchCategory }: any) => {
  const categories = [
    {name: "Web Development", icon: <CodeIcon />}, 
    {name: "Database", icon: <StorageIcon />}, 
    {name: "YouTube Content", icon: <YouTubeIcon />}, 
    {name: "Educational Courses", icon: <MenuBookIcon />}, 
    {name: "Data Structures & Algorithms", icon: <AccountTreeIcon />}, 
    {name: "Other", icon: <ReorderIcon /> }]
  
  const handleClick = async (category: string ) => {
    searchCategory(category)
  };

  return (
    <>
      {categories.map( (item, idx) => {
        return(
          <div 
          className="category-card" 
          key={idx} 
          onClick={()=> handleClick(item.name)}>
            <div className="category-content">
              <h2>{item.name}</h2>
              <div className="category-icon">
                {item.icon}
              </div>
            </div>
          </div>
        )
      })}
    </>
  );
};

export default Categories;
