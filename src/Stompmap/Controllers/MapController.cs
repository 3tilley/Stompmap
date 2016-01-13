using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNet.Mvc;
using Microsoft.AspNet.Mvc.Rendering;
using Microsoft.Data.Entity;
using Stompmap.Models;

namespace Stompmap.Controllers
{
    public class MapController : Controller
    {
        private ApplicationDbContext _context;

        public MapController(ApplicationDbContext context)
        {
            _context = context;    
        }

        // GET: Map
        public async Task<IActionResult> Index()
        {
            return View(await _context.Map.ToListAsync());
        }

        // GET: Map/Details/5
        public async Task<IActionResult> Details(int? id)
        {
            if (id == null)
            {
                return HttpNotFound();
            }

            Map map = await _context
                .Map
                .Include(m => m.Markers)
                .SingleAsync(m => m.Id == id) ;
            if (map == null)
            {
                return HttpNotFound();
            }

            return View(map);
        }

        // GET: Map/Create
        public IActionResult Create()
        {
            return View();
        }

        // POST: Map/Create
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(Map map)
        {
            if (ModelState.IsValid)
            {
                _context.Map.Add(map);
                await _context.SaveChangesAsync();
                return RedirectToAction("Index");
            }
            return View(map);
        }

        // GET: Map/Edit/5
        public async Task<IActionResult> Edit(int? id)
        {
            if (id == null)
            {
                return HttpNotFound();
            }

            Map map = await _context.Map.SingleAsync(m => m.Id == id);
            if (map == null)
            {
                return HttpNotFound();
            }
            return View(map);
        }

        // POST: Map/Edit/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(Map map)
        {
            if (ModelState.IsValid)
            {
                _context.Update(map);
                await _context.SaveChangesAsync();
                return RedirectToAction("Index");
            }
            return View(map);
        }

        // GET: Map/Delete/5
        [ActionName("Delete")]
        public async Task<IActionResult> Delete(int? id)
        {
            if (id == null)
            {
                return HttpNotFound();
            }

            Map map = await _context.Map.SingleAsync(m => m.Id == id);
            if (map == null)
            {
                return HttpNotFound();
            }

            return View(map);
        }

        // POST: Map/Delete/5
        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteConfirmed(int id)
        {
            Map map = await _context.Map.SingleAsync(m => m.Id == id);
            _context.Map.Remove(map);
            await _context.SaveChangesAsync();
            return RedirectToAction("Index");
        }

        // GET: Map/5
        public async Task<IActionResult> See(int? id)
        {
            if (id == null)
            {
                return HttpNotFound();
            }

            Map map = await _context.Map.SingleAsync(m => m.Id == id);
            if (map == null)
            {
                return HttpNotFound();
            }

            return View(map);
        }
    }
}
