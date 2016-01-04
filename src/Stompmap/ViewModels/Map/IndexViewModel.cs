using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Stompmap.ViewModels.Map
{
    public class IndexViewModel
    {
        public string Name { get; }
        public string Location { get; }
        public double CentreLatitude { get; }
        public double CentreLongtitude { get; }
        public int ZoomLevel { get; }

        public IndexViewModel(Models.Map map) {
            Name = map.Name;
            Location = map.Location;
            CentreLatitude = map.CentreLatitude;
            CentreLongtitude = map.CentreLongtitude;
            ZoomLevel = map.ZoomLevel;
        }
    }


}
