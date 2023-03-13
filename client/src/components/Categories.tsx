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
    {name: "Education Courses", icon: <MenuBookIcon />}, 
    {name: "Data Structures & Algorithms", icon: <AccountTreeIcon />}, 
    {name: "Other", icon: <ReorderIcon /> }]

  return (
    <>
      {categories.map( (item, idx) => {
        return(
          <div 
          className="category-card" 
          key={idx} 
          onClick={()=> searchCategory(item.name)}>
              <h2>{item.name}</h2>
              <div className="category-icon">
                {item.icon}
              </div>
          </div>
        )
      })}
    </>
  );
};

export default Categories;
