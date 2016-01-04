using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNet.Mvc;

// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace Stompmap.Controllers
{
    public class MapController2 : Controller
    {
        // GET: /<controller>/
        public IActionResult Index()
        {
            var model = new Models.Map();

            var vm = new ViewModels.Map.IndexViewModel(model);
            
            return View(vm);
        }
    }
}
