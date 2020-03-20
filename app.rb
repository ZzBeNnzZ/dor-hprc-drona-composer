require 'erubi'
require 'json'
require './showquota'
require './squeue'
require './myproject'
require './utilization'

set :erb, :escape_html => true

if development?
  require 'sinatra/reloader'
  also_reload './showquota.rb'
  also_reload './squeue.rb'
  also_reload './myproject.rb'
end

helpers do
  def dashboard_title
    "Open OnDemand"
  end

  def dashboard_url
    "/pun/sys/dashboard/"
  end

  def title
    "Your Dashboard"
  end
end

# Define a route at the root '/' of the app.
get '/' do

  @showquota = ShowQuota.new
  @quota, @quota_error = @showquota.exec

  @squeue = Squeue.new
  @jobs, @squeue_error = @squeue.exec

  @utilization = Utilization.new
  @usages, @usage_error = @utilization.exec

  @myproject = MyProject.new
  @allocations, @allocation_error, @myproject_out = @myproject.exec
  # Render the view
  erb :index
end

get '/allocations' do 
  myproject = MyProject.new
  allocations, allocation_error = myproject.exec
  
  allocations.to_json
end
